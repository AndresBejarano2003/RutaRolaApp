import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { TiempoReal } from 'src/app/core/tiempo-real';
import { LecturaGps, PosicionGps, RecorridoEnMapa, ResultadoLoteGps } from './gps';
import { GpsRepositorio } from './gps-repositorio';

/**
 * | Operación       | Petición |
 * |-----------------|----------|
 * | enviar          | `POST /recorridos/{id}/gps {posiciones: LecturaGps[]}` (≤ 500, `gps.reportar`, solo el personal del recorrido) → `{recibidas, descartadas, ultima}` |
 * | ultima          | `GET /recorridos/{id}/gps/ultima` → `PosicionGps` o 204 (acudiente: solo EN_CURSO y de su estudiante) |
 * | trayecto        | `GET /recorridos/{id}/gps?desde=` (administrador y personal; 403 al acudiente) |
 * | enCurso         | `GET /recorridos/en-curso` → `RecorridoEnMapa[]` (`recorridos.leer`) |
 * | observar        | hub `/hubs/recorridos`: `Seguir(id)` → eventos `posicion` |
 * | observarEmpresa | hub: `SeguirEmpresa()` → `posicion` de todos y `recorridoActualizado` |
 *
 * Repetidas (misma fecha) y lecturas fuera de inicio − 5 min … fin + 5 min se descartan, así que un lote
 * guardado sin red se puede enviar aunque el recorrido ya haya terminado. Las ubicaciones se borran
 * a los `Gps:DiasRetencion` días (30 por defecto).
 */
@Injectable()
export class GpsHttp extends GpsRepositorio {
  private readonly http = inject(HttpClient);
  private readonly tiempoReal = inject(TiempoReal);
  private readonly url = `${environment.apiUrl}/recorridos`;

  enviar(recorridoId: string, lecturas: LecturaGps[]): Observable<ResultadoLoteGps> {
    return this.http.post<ResultadoLoteGps>(`${this.url}/${encodeURIComponent(recorridoId)}/gps`, { posiciones: lecturas });
  }

  ultima(recorridoId: string): Observable<PosicionGps | null> {
    return this.http
      .get<PosicionGps | null>(`${this.url}/${encodeURIComponent(recorridoId)}/gps/ultima`, { observe: 'response' })
      .pipe(map((r) => (r.status === 204 ? null : r.body)));
  }

  trayecto(recorridoId: string): Observable<PosicionGps[]> {
    return this.http.get<PosicionGps[]>(`${this.url}/${encodeURIComponent(recorridoId)}/gps`);
  }

  enCurso(): Observable<RecorridoEnMapa[]> {
    return this.http.get<RecorridoEnMapa[]>(`${this.url}/en-curso`);
  }

  observar(recorridoId: string): Observable<PosicionGps> {
    return this.tiempoReal.posicionesDe(recorridoId);
  }

  observarEmpresa(): Observable<PosicionGps | null> {
    // Cualquier cambio (inicio, paradas, fin) vuelve a pedir la lista: cambia el conteo de cada ruta.
    return this.tiempoReal.empresaCompleta().pipe(map((e) => ('posicion' in e ? e.posicion : null)));
  }
}
