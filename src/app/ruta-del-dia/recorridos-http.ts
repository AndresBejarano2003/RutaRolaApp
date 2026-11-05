import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
 * | iniciar     | `POST /recorridos` `{asignacionId, trayecto}` → `Recorrido` con snapshot de ruta, colegio, vehículo y paradas |
 * | marcar      | `PATCH /recorridos/{id}/paradas` `{estudianteIds, estado}` → `Recorrido` |
 * | finalizar   | `POST /recorridos/{id}/finalizar` `{observaciones}` → `Recorrido` |
 *
 * Reglas (iguales a `RecorridosLocal`):
 * - 422: asignación inactiva, fuera de su periodo o de otro empleado; ruta inactiva o sin estudiantes;
 *   transición de estado no permitida (`transicionPermitida`); recorrido ya finalizado;
 *   finalizar con estudiantes pendientes o A BORDO (`motivoNoFinalizar`).
 * - 409: ya existe el recorrido de ese trayecto hoy, u otro recorrido EN_CURSO de la asignación.
 * - El servidor guarda la hora de cada cambio y puede avisar al acudiente (recogido, entregado, no asistió).
 */
@Injectable()
export class RecorridosHttp extends RecorridosRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/recorridos`;

  rutasDelDia(fecha: string): Observable<RutaAsignada[]> {
    return this.http.get<RutaAsignada[]>(`${this.url}/del-dia`, { params: { fecha } });
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

  finalizar(id: string, observaciones: string): Observable<Recorrido> {
    return this.http.post<Recorrido>(`${this.url}/${encodeURIComponent(id)}/finalizar`, { observaciones });
  }
}
