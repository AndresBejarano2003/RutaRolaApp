import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AutenticacionRepositorio } from '../autenticacion/autenticacion-repositorio';
import { AcudientesRepositorio } from '../personas/acudientes/acudientes-repositorio';
import { EmpleadosRepositorio } from '../personas/empleados/empleados-repositorio';
import { repositoriosDePrueba } from '../shared/pruebas/pruebas';
import { AuthService, CLAVE_SESION, Sesion, rutaInicio } from './auth';
import { soloInvitados, soloRoles } from './guardias';

const sesion = (rol: Sesion['rol']): Sesion => ({
  usuario: 'x', nombre: 'Prueba', correo: '', rol, empleadoId: rol === 'ADMINISTRADOR' ? null : 'emp-1', imagen: '', inicio: '',
});

describe('Sesión y tipos de usuario', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...repositoriosDePrueba()] });
  });

  it('el login local valida usuario y contraseña: admin local y empleados según su tipo', async () => {
    const repo = TestBed.inject(AutenticacionRepositorio);
    const admin = await firstValueFrom(repo.iniciarSesion({ usuario: ' Admin ', contrasena: 'rutarola' }));
    expect(admin).toMatchObject({ rol: 'ADMINISTRADOR', empleadoId: null });

    const conductor = await firstValueFrom(repo.iniciarSesion({ usuario: 'JCardenas', contrasena: 'rutarola' }));
    expect(conductor).toMatchObject({ rol: 'CONDUCTOR', empleadoId: 'emp-1', nombre: 'José Luis Cárdenas Rojas' });

    const monitora = await firstValueFrom(repo.iniciarSesion({ usuario: 'ycharry', contrasena: 'rutarola' }));
    expect(monitora).toMatchObject({ rol: 'MONITORA', empleadoId: 'emp-6' });

    const acudiente = await firstValueFrom(repo.iniciarSesion({ usuario: 'mperez', contrasena: 'rutarola' }));
    expect(acudiente).toMatchObject({ rol: 'ACUDIENTE', acudienteId: 'acu-1', empleadoId: null, nombre: 'María Pérez López' });
    await expect(firstValueFrom(repo.iniciarSesion({ usuario: 'hquintero', contrasena: 'rutarola' }))).rejects.toThrow('inactivo');
  });

  it('el usuario es único entre empleados y acudientes', async () => {
    const acudientes = TestBed.inject(AcudientesRepositorio);
    const base = await firstValueFrom(acudientes.obtener('acu-2'));
    const { id, fechaCreacion: _c, fechaActualizacion: _a, ...datos } = base;
    await expect(firstValueFrom(acudientes.actualizar(id, { ...datos, usuario: 'JCardenas' }))).rejects.toThrow('ya está en uso');
    await firstValueFrom(acudientes.actualizar(id, { ...datos, usuario: 'carlos.r', contrasena: '' }));

    const empleados = TestBed.inject(EmpleadosRepositorio);
    const emp = await firstValueFrom(empleados.obtener('emp-7'));
    const { id: idEmp, fechaCreacion: _c2, fechaActualizacion: _a2, ...datosEmp } = emp;
    await expect(firstValueFrom(empleados.actualizar(idEmp, { ...datosEmp, usuario: 'carlos.r' }))).rejects.toThrow('ya está en uso');
    // Cambiar el usuario conserva la contraseña de ejemplo.
    const repo = TestBed.inject(AutenticacionRepositorio);
    expect((await firstValueFrom(repo.iniciarSesion({ usuario: 'carlos.r', contrasena: 'rutarola' }))).acudienteId).toBe('acu-2');
  });

  it('rechaza credenciales vacías, usuario o contraseña incorrectos y empleados inactivos', async () => {
    const repo = TestBed.inject(AutenticacionRepositorio);
    const intentar = (usuario: string, contrasena: string) => firstValueFrom(repo.iniciarSesion({ usuario, contrasena }));
    await expect(intentar(' ', '')).rejects.toThrow('usuario y tu contraseña');
    await expect(intentar('jcardenas', 'otra')).rejects.toThrow('Usuario o contraseña incorrectos');
    await expect(intentar('nadie', 'rutarola')).rejects.toThrow('Usuario o contraseña incorrectos');
    await expect(intentar('admin', 'x')).rejects.toThrow('Usuario o contraseña incorrectos');
    await expect(intentar('rpolania', 'rutarola')).rejects.toThrow('inactivo');
  });

  it('el usuario y la contraseña se definen al crear el empleado y la contraseña no queda en el registro', async () => {
    const empleados = TestBed.inject(EmpleadosRepositorio);
    const base = await firstValueFrom(empleados.obtener('emp-7'));
    const { id: _i, fechaCreacion: _c, fechaActualizacion: _a, ...datos } = base;
    const nuevo = { ...datos, numeroDocumento: '55555555', usuario: 'Nueva.Monitora@Correo.com', contrasena: 'clave123' };
    await expect(firstValueFrom(empleados.crear({ ...nuevo, usuario: 'stovar' }))).rejects.toThrow('ya está en uso');
    await expect(firstValueFrom(empleados.crear({ ...nuevo, usuario: 'admin' }))).rejects.toThrow('ya está en uso');
    await expect(firstValueFrom(empleados.crear({ ...nuevo, contrasena: '123' }))).rejects.toThrow('al menos 6');
    const creado = await firstValueFrom(empleados.crear(nuevo));
    expect(creado).toMatchObject({ usuario: 'nueva.monitora@correo.com', contrasena: '' });

    const repo = TestBed.inject(AutenticacionRepositorio);
    expect((await firstValueFrom(repo.iniciarSesion({ usuario: 'nueva.monitora@correo.com', contrasena: 'clave123' }))).empleadoId).toBe(creado.id);

    // Al editar, contraseña vacía = conservar; cambiar el usuario conserva la contraseña.
    const { id, fechaCreacion: _c2, fechaActualizacion: _a2, ...editar } = creado;
    await firstValueFrom(empleados.actualizar(id, { ...editar, usuario: 'nmonitora', contrasena: '' }));
    expect((await firstValueFrom(repo.iniciarSesion({ usuario: 'nmonitora', contrasena: 'clave123' }))).rol).toBe('MONITORA');
    expect(JSON.stringify(localStorage.getItem('rutarola.empleados'))).not.toContain('clave123');
  });

  it('"Recordarme" guarda la sesión en localStorage; cerrar sesión no borra los datos de los módulos', () => {
    const auth = TestBed.inject(AuthService);
    localStorage.setItem('rutarola.estudiantes', '[]');
    auth.abrirSesion(sesion('ADMINISTRADOR'), true);
    expect(localStorage.getItem(CLAVE_SESION)).toContain('ADMINISTRADOR');
    auth.abrirSesion(sesion('CONDUCTOR'));
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(sessionStorage.getItem(CLAVE_SESION)).toContain('CONDUCTOR');
    auth.cerrarSesion();
    expect(auth.sesion()).toBeNull();
    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(localStorage.getItem('rutarola.estudiantes')).toBe('[]');
  });

  it('los guards llevan a cada rol a su sistema', () => {
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const guardAdmin = soloRoles('ADMINISTRADOR');
    const evaluar = (guard: typeof guardAdmin, url = '/inicio') =>
      TestBed.runInInjectionContext(() => guard({} as never, { url } as never));
    const texto = (r: unknown) => (typeof r === 'boolean' ? r : router.serializeUrl(r as never));

    expect(texto(evaluar(guardAdmin, '/personas/estudiantes'))).toBe('/login?volver=%2Fpersonas%2Festudiantes');
    auth.abrirSesion(sesion('CONDUCTOR'));
    expect(texto(evaluar(guardAdmin))).toBe(rutaInicio('CONDUCTOR'));
    expect(texto(evaluar(soloRoles('CONDUCTOR', 'MONITORA')))).toBe(true);
    expect(texto(evaluar(soloInvitados))).toBe('/ruta-del-dia');
    auth.abrirSesion(sesion('ADMINISTRADOR'));
    expect(texto(evaluar(guardAdmin))).toBe(true);
    expect(texto(evaluar(soloRoles('CONDUCTOR', 'MONITORA')))).toBe('/inicio');
  });
});
