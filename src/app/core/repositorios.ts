import { AbstractType, Provider, Type } from "@angular/core";
import { environment } from "@environments/environment";
import { AutenticacionHttp } from "../autenticacion/autenticacion-http";
import { AutenticacionLocal } from "../autenticacion/autenticacion-local";
import { AutenticacionRepositorio } from "../autenticacion/autenticacion-repositorio";
import { PortalLocal } from "../portal/portal-local";
import { PortalRepositorio } from "../portal/portal-repositorio";
import { RecorridosLocal } from "../ruta-del-dia/recorridos-local";
import { RecorridosRepositorio } from "../ruta-del-dia/recorridos-repositorio";
import { TableroLocal } from "../inicio/dashboard/tablero-local";
import { TableroRepositorio } from "../inicio/dashboard/tablero-repositorio";
import { CentroNotificaciones } from "../inicio/notificaciones/centro-notificaciones";
import { NotificacionesLocal } from "../inicio/notificaciones/notificaciones-local";
import { NotificacionesRepositorio } from "../inicio/notificaciones/notificaciones-repositorio";
import { CotizacionesLocal } from "../finanzas/cotizaciones/cotizaciones-local";
import { CotizacionesRepositorio } from "../finanzas/cotizaciones/cotizaciones-repositorio";
import { FacturasLocal } from "../finanzas/facturas/facturas-local";
import { FacturasRepositorio } from "../finanzas/facturas/facturas-repositorio";
import { ProgramacionesLocal } from "../finanzas/programacion/programaciones-local";
import { ProgramacionesRepositorio } from "../finanzas/programacion/programaciones-repositorio";
import { RecibosLocal } from "../finanzas/recibos/recibos-local";
import { RecibosRepositorio } from "../finanzas/recibos/recibos-repositorio";
import { ReportesLocal } from "../finanzas/reportes/reportes-local";
import { ReportesRepositorio } from "../finanzas/reportes/reportes-repositorio";
import { AsignacionesLocal } from "../operacion/asignaciones/asignaciones-local";
import { AsignacionesRepositorio } from "../operacion/asignaciones/asignaciones-repositorio";
import { ColegiosLocal } from "../operacion/colegios/colegios-local";
import { ColegiosHttp } from "../operacion/colegios/colegios-http";
import { ColegiosRepositorio } from "../operacion/colegios/colegios-repositorio";
import { ConductoresLocal } from "../operacion/conductores/conductores-local";
import { ConductoresHttp } from "../operacion/conductores/conductores-http";
import { ConductoresRepositorio } from "../operacion/conductores/conductores-repositorio";
import { HistorialRecorridosLocal } from "../operacion/recorridos/historial-recorridos-local";
import { HistorialRecorridosRepositorio } from "../operacion/recorridos/historial-recorridos-repositorio";
import { RutasLocal } from "../operacion/rutas/rutas-local";
import { RutasRepositorio } from "../operacion/rutas/rutas-repositorio";
import { VehiculosLocal } from "../operacion/vehiculos/vehiculos-local";
import { VehiculosHttp } from "../operacion/vehiculos/vehiculos-http";
import { VehiculosRepositorio } from "../operacion/vehiculos/vehiculos-repositorio";
import { AcudientesLocal } from "../personas/acudientes/acudientes-local";
import { AcudientesHttp } from "../personas/acudientes/acudientes-http";
import { AcudientesRepositorio } from "../personas/acudientes/acudientes-repositorio";
import { EmpleadosLocal } from "../personas/empleados/empleados-local";
import { EmpleadosHttp } from "../personas/empleados/empleados-http";
import { EmpleadosRepositorio } from "../personas/empleados/empleados-repositorio";
import { EstudiantesLocal } from "../personas/estudiantes/estudiantes-local";
import { EstudiantesHttp } from "../personas/estudiantes/estudiantes-http";
import { EstudiantesRepositorio } from "../personas/estudiantes/estudiantes-repositorio";

/**
 * ÚNICO lugar donde se elige la fuente de datos de cada módulo.
 *
 * Se registran una sola vez en la ruta padre de los módulos internos
 * (`modulos.routes.ts`) porque los módulos se enlazan entre sí
 * (estudiantes ↔ colegios ↔ rutas ↔ asignaciones; facturas ↔ recibos ↔
 * programación ↔ reportes) y todos deben compartir la misma instancia.
 *
 * Los módulos que ya tienen API usan `api(XRepositorio, XLocal, XHttp)`: HTTP cuando `environment.usarApi`
 * (desarrollo), local en `npm run start:local`, en producción (hasta desplegar el API) y en las
 * pruebas (`repositoriosDePrueba()`). Para conectar otro módulo, cambiar su
 * `{ provide: XRepositorio, useClass: XLocal }` por `api(XRepositorio, XLocal, XHttp)`. El login va con Personas: los usuarios se crean en sus formularios.
 */
export function proveerRepositorios({
  usarApi = environment.usarApi,
}: { usarApi?: boolean } = {}): Provider[] {
  const api = <T>(
    token: AbstractType<T>,
    local: Type<T>,
    http: Type<T>,
  ): Provider => ({
    provide: token,
    useClass: usarApi ? http : local,
  });
  return [
    // Personas
    api(EstudiantesRepositorio, EstudiantesLocal, EstudiantesHttp),
    api(AcudientesRepositorio, AcudientesLocal, AcudientesHttp),
    api(EmpleadosRepositorio, EmpleadosLocal, EmpleadosHttp),
    // Operación
    api(ColegiosRepositorio, ColegiosLocal, ColegiosHttp),
    api(VehiculosRepositorio, VehiculosLocal, VehiculosHttp),
    { provide: RutasRepositorio, useClass: RutasLocal },
    { provide: AsignacionesRepositorio, useClass: AsignacionesLocal },
    api(ConductoresRepositorio, ConductoresLocal, ConductoresHttp),
    {
      provide: HistorialRecorridosRepositorio,
      useClass: HistorialRecorridosLocal,
    },
    // Finanzas
    { provide: CotizacionesRepositorio, useClass: CotizacionesLocal },
    { provide: FacturasRepositorio, useClass: FacturasLocal },
    { provide: RecibosRepositorio, useClass: RecibosLocal },
    { provide: ProgramacionesRepositorio, useClass: ProgramacionesLocal },
    { provide: ReportesRepositorio, useClass: ReportesLocal },
    // Inicio (resumen de todos los módulos)
    { provide: TableroRepositorio, useClass: TableroLocal },
    // Notificaciones (leen datos de todos los módulos). `CentroNotificaciones` es el estado
    // compartido de la campana y la página; va aquí porque necesita estos repositorios.
    { provide: NotificacionesRepositorio, useClass: NotificacionesLocal },
    CentroNotificaciones,
    // Acceso (el login local resuelve el rol con los empleados) y ruta del día de conductores/monitoras
    api(AutenticacionRepositorio, AutenticacionLocal, AutenticacionHttp),
    { provide: RecorridosRepositorio, useClass: RecorridosLocal },
    // Portal del acudiente (lee todos los módulos)
    { provide: PortalRepositorio, useClass: PortalLocal },
  ];
}
