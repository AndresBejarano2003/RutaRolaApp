import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { AutenticacionHttp } from '../autenticacion/autenticacion-http';
import { AuthService, CLAVE_SESION, Sesion, TokensSesion } from './auth';
import { interceptorAutenticacion } from './interceptor-autenticacion';

const API = environment.apiUrl;

const tokens = (n: number): TokensSesion => ({
  accessToken: `acceso-${n}`,
  accessTokenExpira: '2030-01-01T00:15:00Z',
  refreshToken: `refresh-${n}`,
  refreshTokenExpira: '2030-01-31T00:00:00Z',
});

const sesion = (t?: TokensSesion): Sesion => ({
  usuario: 'admin', nombre: 'Admin', correo: '', rol: 'ADMINISTRADOR', empleadoId: null, imagen: '', inicio: '', tokens: t,
});

describe('Interceptor de autenticación con el API', () => {
  let http: HttpClient;
  let api: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([interceptorAutenticacion])),
        provideHttpClientTesting(),
        AutenticacionHttp,
      ],
    });
    http = TestBed.inject(HttpClient);
    api = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => api.verify());

  it('agrega el Bearer solo a las peticiones al API y no a las de sesión', () => {
    auth.abrirSesion(sesion(tokens(1)));

    http.get(`${API}/configuracion`).subscribe();
    expect(api.expectOne(`${API}/configuracion`).request.headers.get('Authorization')).toBe('Bearer acceso-1');

    http.get('https://otro-sitio.example/datos').subscribe();
    expect(api.expectOne('https://otro-sitio.example/datos').request.headers.has('Authorization')).toBe(false);

    http.post(`${API}/auth/login`, {}).subscribe();
    expect(api.expectOne(`${API}/auth/login`).request.headers.has('Authorization')).toBe(false);
  });

  it('en modo local (sesión sin tokens) no toca las peticiones', () => {
    auth.abrirSesion(sesion());
    http.get(`${API}/configuracion`).subscribe();
    expect(api.expectOne(`${API}/configuracion`).request.headers.has('Authorization')).toBe(false);
  });

  it('ante 401 renueva UNA vez para varias peticiones, guarda los tokens nuevos y repite cada petición', async () => {
    auth.abrirSesion(sesion(tokens(1)), true);
    const a = firstValueFrom(http.get<{ ok: string }>(`${API}/a`));
    const b = firstValueFrom(http.get<{ ok: string }>(`${API}/b`));

    api.expectOne(`${API}/a`).flush({}, { status: 401, statusText: 'Unauthorized' });
    api.expectOne(`${API}/b`).flush({}, { status: 401, statusText: 'Unauthorized' });

    const refresh = api.expectOne(`${API}/auth/refresh`);
    expect(refresh.request.body).toEqual({ refreshToken: 'refresh-1' });
    refresh.flush(tokens(2));

    const reintentoA = api.expectOne(`${API}/a`);
    const reintentoB = api.expectOne(`${API}/b`);
    expect(reintentoA.request.headers.get('Authorization')).toBe('Bearer acceso-2');
    expect(reintentoB.request.headers.get('Authorization')).toBe('Bearer acceso-2');
    reintentoA.flush({ ok: 'a' });
    reintentoB.flush({ ok: 'b' });

    expect(await a).toEqual({ ok: 'a' });
    expect(await b).toEqual({ ok: 'b' });
    expect(auth.tokens()?.refreshToken).toBe('refresh-2');
    // Se guarda donde estaba la sesión ("Recordarme" → localStorage).
    expect(JSON.parse(localStorage.getItem(CLAVE_SESION)!).tokens.refreshToken).toBe('refresh-2');
  });

  it('si la renovación falla cierra la sesión (sin revocar) y vuelve al login', async () => {
    auth.abrirSesion(sesion(tokens(1)));
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const peticion = firstValueFrom(http.get(`${API}/a`));

    api.expectOne(`${API}/a`).flush({ mensaje: 'Tu sesión expiró.' }, { status: 401, statusText: 'Unauthorized' });
    api.expectOne(`${API}/auth/refresh`).flush({ mensaje: 'Tu sesión expiró.' }, { status: 401, statusText: 'Unauthorized' });

    await expect(peticion).rejects.toMatchObject({ status: 401 });
    expect(auth.autenticado()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/login'], expect.anything());
    api.expectNone(`${API}/auth/logout`);
  });

  it('usa los tokens que otra pestaña ya renovó en vez de reusar el refresh viejo', async () => {
    auth.abrirSesion(sesion(tokens(1)), true);
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion(tokens(5))));
    const peticion = firstValueFrom(http.get(`${API}/a`));

    api.expectOne(`${API}/a`).flush({}, { status: 401, statusText: 'Unauthorized' });
    api.expectNone(`${API}/auth/refresh`);
    const reintento = api.expectOne(`${API}/a`);
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer acceso-5');
    reintento.flush({});
    await peticion;
  });

  it('otros errores pasan tal cual, sin renovar', async () => {
    auth.abrirSesion(sesion(tokens(1)));
    const peticion = firstValueFrom(http.get(`${API}/a`));
    api.expectOne(`${API}/a`).flush({ mensaje: 'No tienes permisos' }, { status: 403, statusText: 'Forbidden' });
    await expect(peticion).rejects.toMatchObject({ status: 403 });
    api.expectNone(`${API}/auth/refresh`);
  });

  it('cerrar sesión revoca el refresh token en el servidor', () => {
    auth.abrirSesion(sesion(tokens(3)));
    auth.cerrarSesion();
    const logout = api.expectOne(`${API}/auth/logout`);
    expect(logout.request.body).toEqual({ refreshToken: 'refresh-3' });
    logout.flush(null, { status: 204, statusText: 'No Content' });
    expect(auth.sesion()).toBeNull();
  });

  it('AutenticacionHttp arma la sesión con sus tokens y rechaza usuarios de la plataforma', async () => {
    const repo = TestBed.inject(AutenticacionHttp);
    const datos = { usuario: 'admin', nombre: 'Admin', correo: 'a@b.co', empleadoId: null, acudienteId: null, imagen: '', inicio: '2026-01-01T00:00:00Z' };

    const ok = firstValueFrom(repo.iniciarSesion({ usuario: ' admin ', contrasena: 'x' }));
    const login = api.expectOne(`${API}/auth/login`);
    expect(login.request.body).toEqual({ usuario: 'admin', contrasena: 'x' });
    login.flush({ sesion: { ...datos, rol: 'ADMINISTRADOR' }, tokens: tokens(1) });
    expect(await ok).toMatchObject({ rol: 'ADMINISTRADOR', tokens: { accessToken: 'acceso-1' } });

    const plataforma = firstValueFrom(repo.iniciarSesion({ usuario: 'superadmin', contrasena: 'x' }));
    api.expectOne(`${API}/auth/login`).flush({ sesion: { ...datos, rol: 'SUPER_ADMIN' }, tokens: tokens(2) });
    await expect(plataforma).rejects.toThrow('no tiene acceso');
  });
});
