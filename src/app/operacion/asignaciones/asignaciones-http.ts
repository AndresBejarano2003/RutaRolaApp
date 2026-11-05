import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { Asignacion, FiltrosAsignacion } from './asignacion';
import { AsignacionesRepositorio } from './asignaciones-repositorio';

/**
 * Conexión al API: `{apiUrl}/asignaciones` (filtros `rutaId`, `vehiculoId`,
 * `empleadoId`, `estado`).
 *
 * Reglas que debe validar el API (409/422 con `{ "mensaje" }`), igual que
 * `AsignacionesLocal`:
 * - una sola asignación activa por ruta;
 * - vehículo, conductor y monitora no pueden estar en dos asignaciones
 *   activas de la misma jornada;
 * - la capacidad del vehículo cubre a los estudiantes de la ruta;
 * - licencia del conductor y documentos del vehículo sin vencer.
 */
@Injectable()
export class AsignacionesHttp extends RepositorioHttp<Asignacion, FiltrosAsignacion> implements AsignacionesRepositorio {
  protected readonly recurso = 'asignaciones';
}
