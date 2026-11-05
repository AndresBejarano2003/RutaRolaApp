import { Observable } from 'rxjs';
import { EstadoParada, Recorrido, RutaAsignada, Trayecto } from './recorrido';

/**
 * Recorridos de la ruta del día del empleado AUTENTICADO (conductor o monitora).
 * El conductor y la monitora de una asignación comparten el mismo recorrido.
 * Implementaciones: `RecorridosLocal` (temporal) → `RecorridosHttp`.
 */
export abstract class RecorridosRepositorio {
  /** Rutas que cubre hoy (asignaciones activas vigentes en `fecha`) con sus recorridos del día. */
  abstract rutasDelDia(fecha: string): Observable<RutaAsignada[]>;
  abstract obtener(id: string): Observable<Recorrido>;
  /** Inicia el trayecto de una asignación; el servidor arma las paradas desde la ruta y los estudiantes. */
  abstract iniciar(asignacionId: string, trayecto: Trayecto): Observable<Recorrido>;
  /** Cambia el estado de uno o varios estudiantes (p. ej. "entregar todos en el colegio"). */
  abstract marcar(id: string, estudianteIds: string[], estado: EstadoParada): Observable<Recorrido>;
  abstract finalizar(id: string, observaciones: string): Observable<Recorrido>;
}
