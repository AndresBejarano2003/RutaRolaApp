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
import { NotificacionesLocal } from '../inicio/notificaciones/notificaciones-local';
import { NotificacionesRepositorio } from '../inicio/notificaciones/notificaciones-repositorio';
import { PortalLocal } from '../portal/portal-local';
import { PortalRepositorio } from '../portal/portal-repositorio';
import { TableroHttp } from '../inicio/dashboard/tablero-http';
import { TableroRepositorio } from '../inicio/dashboard/tablero-repositorio';
import { RutasHttp } from '../operacion/rutas/rutas-http';
import { RutasRepositorio } from '../operacion/rutas/rutas-repositorio';
import { RecorridosHttp } from '../ruta-del-dia/recorridos-http';
import { RecorridosRepositorio } from '../ruta-del-dia/recorridos-repositorio';
import { EstudiantesLocal } from '../personas/estudiantes/estudiantes-local';
import { EstudiantesRepositorio } from '../personas/estudiantes/estudiantes-repositorio';
import { proveerRepositorios } from './repositorios';

describe('Registro de repositorios', () => {
  const configurar = (usarApi: boolean) =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ...proveerRepositorios({ usarApi })],
    });

  it('con API usa HTTP en los módulos migrados (y el login) y local en los demás', () => {
    configurar(true);

    expect(TestBed.inject(ColegiosRepositorio)).toBeInstanceOf(ColegiosHttp);
    expect(TestBed.inject(AutenticacionRepositorio)).toBeInstanceOf(AutenticacionHttp);
    expect(TestBed.inject(RutasRepositorio)).toBeInstanceOf(RutasHttp);
    expect(TestBed.inject(RecorridosRepositorio)).toBeInstanceOf(RecorridosHttp);
    expect(TestBed.inject(FacturasRepositorio)).toBeInstanceOf(FacturasHttp);
    expect(TestBed.inject(TableroRepositorio)).toBeInstanceOf(TableroHttp);
    // Pendientes de la fase 7 (comunicación).
    expect(TestBed.inject(NotificacionesRepositorio)).toBeInstanceOf(NotificacionesLocal);
    expect(TestBed.inject(PortalRepositorio)).toBeInstanceOf(PortalLocal);
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
