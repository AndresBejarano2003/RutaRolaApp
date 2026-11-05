import { Observable } from 'rxjs';
import { CuotaPendiente, FiltrosIngresos, FiltrosMorosos, FiltrosPendientes, Moroso, ReporteIngresos } from './reportes';

/**
 * Reportes financieros (solo lectura). Con API se calculan en el servidor:
 * - `GET /reportes/ingresos?desde=&hasta=&medioPago=` → `ReporteIngresos`
 * - `GET /reportes/facturas-pendientes?texto=&acudienteId=&situacion=` → `CuotaPendiente[]`
 * - `GET /reportes/morosos?texto=&diasMinimos=` → `Moroso[]`
 */
export abstract class ReportesRepositorio {
  abstract ingresos(filtros: FiltrosIngresos): Observable<ReporteIngresos>;
  abstract pendientes(filtros: FiltrosPendientes): Observable<CuotaPendiente[]>;
  abstract morosos(filtros: FiltrosMorosos): Observable<Moroso[]>;
}
