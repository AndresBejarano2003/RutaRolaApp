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
  /**
   * Emite las rutas del día cada vez que cambian en otro dispositivo (p. ej. el compañero inició un
   * trayecto), para que conductor y monitora vean lo mismo sin recargar.
   */
  abstract observarRutasDelDia(fecha: string): Observable<RutaAsignada[]>;
  /**
   * Inicia el trayecto de una asignación; el servidor arma las paradas desde la ruta y los estudiantes.
   * Si el compañero YA lo inició hoy, devuelve ese mismo recorrido (conductor y monitora comparten uno).
   */
  abstract iniciar(asignacionId: string, trayecto: Trayecto): Observable<Recorrido>;
  /** Cambia el estado de uno o varios estudiantes (p. ej. "entregar todos en el colegio"). */
  abstract marcar(id: string, estudianteIds: string[], estado: EstadoParada): Observable<Recorrido>;
  /**
   * Cambia el orden de visita de los estudiantes que faltan (`estudianteIds` = todos los por visitar,
   * en el nuevo orden). Solo la monitora (o el conductor si la ruta no tiene monitora).
   */
  abstract reordenar(id: string, estudianteIds: string[]): Observable<Recorrido>;
  /**
   * Emite el recorrido cada vez que cambia en otro dispositivo (marcas u orden), para que el
   * conductor y la monitora vean lo mismo. Termina cuando se deja de escuchar.
   */
  abstract observar(id: string): Observable<Recorrido>;
  abstract finalizar(id: string, observaciones: string): Observable<Recorrido>;
}
