import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { AutenticacionHttp } from '../autenticacion/autenticacion-http';
import { AutenticacionRepositorio } from '../autenticacion/autenticacion-repositorio';
import { ColegiosHttp } from '../operacion/colegios/colegios-http';
import { ColegiosRepositorio } from '../operacion/colegios/colegios-repositorio';
import { FacturasHttp } from '../finanzas/facturas/facturas-http';
import { FacturasRepositorio } from '../finanzas/facturas/facturas-repositorio';
import { NotificacionesHttp } from '../inicio/notificaciones/notificaciones-http';
import { NotificacionesRepositorio } from '../inicio/notificaciones/notificaciones-repositorio';
import { PortalHttp } from '../portal/portal-http';
import { PortalRepositorio } from '../portal/portal-repositorio';
import { TableroHttp } from '../inicio/dashboard/tablero-http';
import { TableroRepositorio } from '../inicio/dashboard/tablero-repositorio';
import { RutasHttp } from '../operacion/rutas/rutas-http';
import { RutasRepositorio } from '../operacion/rutas/rutas-repositorio';
import { RecorridosHttp } from '../ruta-del-dia/recorridos-http';
import { RecorridosRepositorio } from '../ruta-del-dia/recorridos-repositorio';
import { EstudiantesLocal } from '../personas/estudiantes/estudiantes-local';
import { EstudiantesRepositorio } from '../personas/estudiantes/estudiantes-repositorio';
import { GpsHttp } from '../ruta-del-dia/gps/gps-http';
import { GpsRepositorio } from '../ruta-del-dia/gps/gps-repositorio';
import { MensajesWhatsappHttp } from '../finanzas/mensajes-whatsapp/mensajes-whatsapp-http';
import { MensajesWhatsappRepositorio } from '../finanzas/mensajes-whatsapp/mensajes-whatsapp-repositorio';
import { ConfiguracionHttp } from '../inicio/configuracion/configuracion-http';
import { ConfiguracionRepositorio } from '../inicio/configuracion/configuracion-repositorio';
import { EmpresasHttp } from '../plataforma/empresas/empresas-http';
import { EmpresasRepositorio } from '../plataforma/empresas/empresas-repositorio';
import { proveerRepositorios } from './repositorios';

describe('Registro de repositorios', () => {
  const configurar = (usarApi: boolean) =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ...proveerRepositorios({ usarApi })],
    });

  it('con API usa HTTP en todos los módulos con endpoint (y el login)', () => {
    configurar(true);

    expect(TestBed.inject(ColegiosRepositorio)).toBeInstanceOf(ColegiosHttp);
    expect(TestBed.inject(AutenticacionRepositorio)).toBeInstanceOf(AutenticacionHttp);
    expect(TestBed.inject(RutasRepositorio)).toBeInstanceOf(RutasHttp);
    expect(TestBed.inject(RecorridosRepositorio)).toBeInstanceOf(RecorridosHttp);
    expect(TestBed.inject(FacturasRepositorio)).toBeInstanceOf(FacturasHttp);
    expect(TestBed.inject(TableroRepositorio)).toBeInstanceOf(TableroHttp);
    expect(TestBed.inject(NotificacionesRepositorio)).toBeInstanceOf(NotificacionesHttp);
    expect(TestBed.inject(PortalRepositorio)).toBeInstanceOf(PortalHttp);
    expect(TestBed.inject(GpsRepositorio)).toBeInstanceOf(GpsHttp);
    expect(TestBed.inject(MensajesWhatsappRepositorio)).toBeInstanceOf(MensajesWhatsappHttp);
    expect(TestBed.inject(ConfiguracionRepositorio)).toBeInstanceOf(ConfiguracionHttp);
    expect(TestBed.inject(EmpresasRepositorio)).toBeInstanceOf(EmpresasHttp);
  });

  it('GPS por HTTP: lote, última (204 = sin posición) y mapa', async () => {
    configurar(true);
    const api = TestBed.inject(HttpTestingController);
    const gps = TestBed.inject(GpsRepositorio);
    const url = `${environment.apiUrl}/recorridos`;

    const lote = firstValueFrom(gps.enviar('r-1', [{ latitud: 1, longitud: 2, velocidad: null, rumbo: null, fecha: '2026-11-05T12:00:00Z' }]));
    const peticion = api.expectOne(`${url}/r-1/gps`);
    expect(peticion.request.body.posiciones).toHaveLength(1);
    peticion.flush({ recibidas: 1, descartadas: 0, ultima: null });
    expect((await lote).recibidas).toBe(1);

    const ultima = firstValueFrom(gps.ultima('r-1'));
    api.expectOne(`${url}/r-1/gps/ultima`).flush(null, { status: 204, statusText: 'No Content' });
    expect(await ultima).toBeNull();

    const mapa = firstValueFrom(gps.enCurso());
    api.expectOne(`${url}/en-curso`).flush([]);
    expect(await mapa).toEqual([]);
  });

  it('sin API todo es local', () => {
    configurar(false);

    expect(TestBed.inject(EstudiantesRepositorio)).toBeInstanceOf(EstudiantesLocal);
  });

  it('motivoNoEliminar por HTTP consulta al API antes de pedir confirmación', async () => {
    configurar(true);
    const api = TestBed.inject(HttpTestingController);

    const motivo = firstValueFrom(TestBed.inject(ColegiosRepositorio).motivoNoEliminar('c-1'));
    api.expectOne(`${environment.apiUrl}/colegios/c-1/motivo-no-eliminar`).flush({ motivo: 'Tiene 2 estudiante(s).' });
    expect(await motivo).toBe('Tiene 2 estudiante(s).');

    const libre = firstValueFrom(TestBed.inject(ColegiosRepositorio).motivoNoEliminar('c-2'));
    api.expectOne(`${environment.apiUrl}/colegios/c-2/motivo-no-eliminar`).flush({ motivo: null });
    expect(await libre).toBeNull();
    api.verify();
  });
});
