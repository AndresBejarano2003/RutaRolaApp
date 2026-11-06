import { Observable } from 'rxjs';
import { LecturaGps, PosicionGps, RecorridoEnMapa, ResultadoLoteGps } from './gps';

/**
 * Ubicación de los vehículos durante los recorridos. Implementaciones: `GpsLocal` (temporal, en el
 * navegador) → `GpsHttp` (API + hub SignalR).
 * Quién ve qué (lo aplica el servidor): el personal del recorrido envía y ve el trayecto; el
 * administrador ve todo lo de su empresa; el acudiente solo la última posición del recorrido de SU
 * estudiante y solo mientras está EN CURSO.
 */
export abstract class GpsRepositorio {
  /** Envía un lote (≤ 500) del personal del recorrido. Repetidas o fuera del periodo se descartan. */
  abstract enviar(recorridoId: string, lecturas: LecturaGps[]): Observable<ResultadoLoteGps>;
  /** Última posición (`null` si aún no hay o, para el acudiente, si el recorrido ya terminó). */
  abstract ultima(recorridoId: string): Observable<PosicionGps | null>;
  /** Trayecto completo en orden (administrador y personal). */
  abstract trayecto(recorridoId: string): Observable<PosicionGps[]>;
  /** Recorridos en curso de la empresa con su posición (administrador). */
  abstract enCurso(): Observable<RecorridoEnMapa[]>;
  /** Cada posición nueva de UN recorrido mientras se escucha. */
  abstract observar(recorridoId: string): Observable<PosicionGps>;
  /**
   * Mapa del administrador: posiciones de cualquier recorrido de la empresa, y `null` cuando
   * conviene volver a pedir `enCurso()` (inició o terminó un recorrido, o se recuperó la conexión).
   */
  abstract observarEmpresa(): Observable<PosicionGps | null>;
}
