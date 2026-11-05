import { Observable } from 'rxjs';
import { RepositorioLectura } from 'src/app/shared/crud/repositorio-crud';
import {
  BandejaNotificaciones,
  FiltrosNotificacion,
  NotificacionSistema,
  ResumenNotificaciones,
} from './notificacion-sistema';

/**
 * Bandeja de notificaciones del usuario (implementación en `core/repositorios.ts`).
 * `listar` ordena de la más reciente a la más antigua.
 */
export abstract class NotificacionesRepositorio extends RepositorioLectura<NotificacionSistema, FiltrosNotificacion> {
  /** Conteo de no leídas y las más recientes, para la campana. */
  abstract resumen(): Observable<ResumenNotificaciones>;
  abstract marcarLeidas(ids: string[], leida: boolean): Observable<void>;
  /** Marca como leídas todas las de la bandeja de entrada. */
  abstract marcarTodasLeidas(): Observable<void>;
  /** Archivar también las marca como leídas; desarchivar las devuelve a la entrada. */
  abstract archivar(ids: string[], archivada: boolean): Observable<void>;
  abstract eliminar(ids: string[]): Observable<void>;
  /** Elimina TODAS las notificaciones de una bandeja. */
  abstract vaciar(bandeja: BandejaNotificaciones): Observable<void>;
}
