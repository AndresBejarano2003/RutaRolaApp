import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Pagina, Paginacion } from 'src/app/shared/crud/crud';
import {
  BandejaNotificaciones,
  FiltrosNotificacion,
  NotificacionSistema,
  ResumenNotificaciones,
} from './notificacion-sistema';
import { NotificacionesRepositorio } from './notificaciones-repositorio';

/**
 * Notificaciones del usuario autenticado. El servidor las CREA (por evento y con un proceso diario
 * de vencimientos, contratos y mora, sin repetir una misma `clave`); el cliente solo las gestiona:
 *
 * | Operación         | Petición                                                                     |
 * |-------------------|------------------------------------------------------------------------------|
 * | listar            | GET    /notificaciones?bandeja=&texto=&categoria=&nivel=&lectura=&pagina=&tamano= → `Pagina` |
 * | resumen           | GET    /notificaciones/resumen → `ResumenNotificaciones`                     |
 * | marcarLeidas      | PATCH  /notificaciones/lectura  `{ ids, leida }`                             |
 * | marcarTodasLeidas | POST   /notificaciones/leer-todas                                            |
 * | archivar          | PATCH  /notificaciones/archivo  `{ ids, archivada }` (archivar = leída)      |
 * | eliminar          | POST   /notificaciones/eliminar `{ ids }`                                    |
 * | vaciar            | DELETE /notificaciones?bandeja=ENTRADA|ARCHIVADAS                            |
 *
 * Solo se afectan las notificaciones del usuario; ids ajenos o inexistentes se ignoran.
 */
@Injectable()
export class NotificacionesHttp extends NotificacionesRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notificaciones`;

  listar(filtros: FiltrosNotificacion, paginacion: Paginacion): Observable<Pagina<NotificacionSistema>> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries({ ...filtros, ...paginacion })) {
      if (valor !== '') params = params.set(clave, String(valor));
    }
    return this.http.get<Pagina<NotificacionSistema>>(this.url, { params });
  }

  resumen(): Observable<ResumenNotificaciones> {
    return this.http.get<ResumenNotificaciones>(`${this.url}/resumen`);
  }

  marcarLeidas(ids: string[], leida: boolean): Observable<void> {
    return this.http.patch<void>(`${this.url}/lectura`, { ids, leida });
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.post<void>(`${this.url}/leer-todas`, {});
  }

  archivar(ids: string[], archivada: boolean): Observable<void> {
    return this.http.patch<void>(`${this.url}/archivo`, { ids, archivada });
  }

  eliminar(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.url}/eliminar`, { ids });
  }

  vaciar(bandeja: BandejaNotificaciones): Observable<void> {
    return this.http.delete<void>(this.url, { params: { bandeja } });
  }
}
