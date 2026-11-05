import { Provider } from '@angular/core';
import { TableroLocal } from '../inicio/dashboard/tablero-local';
import { TableroRepositorio } from '../inicio/dashboard/tablero-repositorio';
import { CentroNotificaciones } from '../inicio/notificaciones/centro-notificaciones';
import { NotificacionesLocal } from '../inicio/notificaciones/notificaciones-local';
import { NotificacionesRepositorio } from '../inicio/notificaciones/notificaciones-repositorio';
import { CotizacionesLocal } from '../finanzas/cotizaciones/cotizaciones-local';
import { CotizacionesRepositorio } from '../finanzas/cotizaciones/cotizaciones-repositorio';
import { FacturasLocal } from '../finanzas/facturas/facturas-local';
import { FacturasRepositorio } from '../finanzas/facturas/facturas-repositorio';
import { ProgramacionesLocal } from '../finanzas/programacion/programaciones-local';
import { ProgramacionesRepositorio } from '../finanzas/programacion/programaciones-repositorio';
import { RecibosLocal } from '../finanzas/recibos/recibos-local';
import { RecibosRepositorio } from '../finanzas/recibos/recibos-repositorio';
import { ReportesLocal } from '../finanzas/reportes/reportes-local';
import { ReportesRepositorio } from '../finanzas/reportes/reportes-repositorio';
import { AsignacionesLocal } from '../operacion/asignaciones/asignaciones-local';
import { AsignacionesRepositorio } from '../operacion/asignaciones/asignaciones-repositorio';
import { ColegiosLocal } from '../operacion/colegios/colegios-local';
import { ColegiosRepositorio } from '../operacion/colegios/colegios-repositorio';
import { ConductoresLocal } from '../operacion/conductores/conductores-local';
import { ConductoresRepositorio } from '../operacion/conductores/conductores-repositorio';
import { RutasLocal } from '../operacion/rutas/rutas-local';
import { RutasRepositorio } from '../operacion/rutas/rutas-repositorio';
import { VehiculosLocal } from '../operacion/vehiculos/vehiculos-local';
import { VehiculosRepositorio } from '../operacion/vehiculos/vehiculos-repositorio';
import { AcudientesLocal } from '../personas/acudientes/acudientes-local';
import { AcudientesRepositorio } from '../personas/acudientes/acudientes-repositorio';
import { EmpleadosLocal } from '../personas/empleados/empleados-local';
import { EmpleadosRepositorio } from '../personas/empleados/empleados-repositorio';
import { EstudiantesLocal } from '../personas/estudiantes/estudiantes-local';
import { EstudiantesRepositorio } from '../personas/estudiantes/estudiantes-repositorio';

/**
 * ÚNICO lugar donde se elige la fuente de datos de cada módulo.
 *
 * Se registran una sola vez en la ruta padre de los módulos internos
 * (`modulos.routes.ts`) porque los módulos se enlazan entre sí
 * (estudiantes ↔ colegios ↔ rutas ↔ asignaciones; facturas ↔ recibos ↔
 * programación ↔ reportes) y todos deben compartir la misma instancia.
 *
 * Para conectar el API de un módulo: cambiar su `useClass` `XLocal` por
 * `XHttp` (p. ej. `{ provide: ColegiosRepositorio, useClass: ColegiosHttp }`).
 */
export function proveerRepositorios(): Provider[] {
  return [
    // Personas
    { provide: EstudiantesRepositorio, useClass: EstudiantesLocal },
    { provide: AcudientesRepositorio, useClass: AcudientesLocal },
    { provide: EmpleadosRepositorio, useClass: EmpleadosLocal },
    // Operación
    { provide: ColegiosRepositorio, useClass: ColegiosLocal },
    { provide: VehiculosRepositorio, useClass: VehiculosLocal },
    { provide: RutasRepositorio, useClass: RutasLocal },
    { provide: AsignacionesRepositorio, useClass: AsignacionesLocal },
    { provide: ConductoresRepositorio, useClass: ConductoresLocal },
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
  ];
}
