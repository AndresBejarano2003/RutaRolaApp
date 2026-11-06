import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, distinctUntilChanged, interval, switchMap } from 'rxjs';
import { environment } from '@environments/environment';
import { EstadoParada, Recorrido, RutaAsignada, Trayecto } from './recorrido';
import { RecorridosRepositorio } from './recorridos-repositorio';

/**
 * El empleado se toma de la SESIÓN (token), nunca de un parámetro: cada quien solo ve sus rutas.
 *
 * | Operación   | Petición |
 * |-------------|----------|
 * | rutasDelDia | `GET /recorridos/del-dia?fecha=YYYY-MM-DD` → `RutaAsignada[]` |
 * | obtener     | `GET /recorridos/{id}` (403 si no es de una asignación del empleado) |
 * | rutas (sync)| `observarRutasDelDia`: `GET /recorridos/del-dia` cada `INTERVALO_SINCRONIZACION_MS` |
 * | iniciar     | `POST /recorridos` `{asignacionId, trayecto}` → 201 `Recorrido` con snapshot de ruta, colegio, vehículo y paradas; 200 con el EXISTENTE si ese trayecto ya se inició hoy (el compañero se une) |
 * | marcar      | `PATCH /recorridos/{id}/paradas` `{estudianteIds, estado}` → `Recorrido` |
 * | reordenar   | `PUT /recorridos/{id}/orden` `{estudianteIds}` → `Recorrido` (guarda `ordenActualizado`) |
 * | finalizar   | `POST /recorridos/{id}/finalizar` `{observaciones}` → `Recorrido` |
 * | observar    | `GET /recorridos/{id}` cada `INTERVALO_SINCRONIZACION_MS` (se puede cambiar por SSE/WebSocket) |
 *
 * Reglas (iguales a `RecorridosLocal`):
 * - 422: asignación inactiva, fuera de su periodo o de otro empleado; ruta inactiva o sin estudiantes;
 *   transición de estado no permitida (`transicionPermitida`); recorrido ya finalizado;
 *   finalizar con estudiantes pendientes o A BORDO (`motivoNoFinalizar`).
 * - 409: otro recorrido (del otro trayecto) EN_CURSO en la asignación;
 *   reordenar con una lista que no es EXACTAMENTE la de las paradas por visitar (`reordenarParadas`).
 * - 403: reordenar sin ser la monitora de la asignación (o el conductor si no tiene monitora) — `puedeReordenar`.
 * - El servidor guarda la hora de cada cambio y puede avisar al acudiente (recogido, entregado, no asistió).
 */
/** Cada cuánto se consulta el recorrido en curso para ver los cambios del compañero. */
export const INTERVALO_SINCRONIZACION_MS = 10_000;

@Injectable()
export class RecorridosHttp extends RecorridosRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/recorridos`;

  rutasDelDia(fecha: string): Observable<RutaAsignada[]> {
    return this.http.get<RutaAsignada[]>(`${this.url}/del-dia`, { params: { fecha } });
  }

  observarRutasDelDia(fecha: string): Observable<RutaAsignada[]> {
    return interval(INTERVALO_SINCRONIZACION_MS).pipe(
      switchMap(() => this.rutasDelDia(fecha).pipe(catchError(() => EMPTY))),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    );
  }

  obtener(id: string): Observable<Recorrido> {
    return this.http.get<Recorrido>(`${this.url}/${encodeURIComponent(id)}`);
  }

  iniciar(asignacionId: string, trayecto: Trayecto): Observable<Recorrido> {
    return this.http.post<Recorrido>(this.url, { asignacionId, trayecto });
  }

  marcar(id: string, estudianteIds: string[], estado: EstadoParada): Observable<Recorrido> {
    return this.http.patch<Recorrido>(`${this.url}/${encodeURIComponent(id)}/paradas`, { estudianteIds, estado });
  }

  reordenar(id: string, estudianteIds: string[]): Observable<Recorrido> {
    return this.http.put<Recorrido>(`${this.url}/${encodeURIComponent(id)}/orden`, { estudianteIds });
  }

  observar(id: string): Observable<Recorrido> {
    return interval(INTERVALO_SINCRONIZACION_MS).pipe(
      // Un fallo puntual (sin red) no corta la sincronización: se reintenta en el siguiente aviso.
      switchMap(() => this.obtener(id).pipe(catchError(() => EMPTY))),
      distinctUntilChanged((a, b) => a.fechaActualizacion === b.fechaActualizacion),
    );
  }

  finalizar(id: string, observaciones: string): Observable<Recorrido> {
    return this.http.post<Recorrido>(`${this.url}/${encodeURIComponent(id)}/finalizar`, { observaciones });
  }
}
