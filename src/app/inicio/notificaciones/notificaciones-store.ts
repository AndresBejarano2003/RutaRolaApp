import { Injectable, inject } from '@angular/core';
import { ListadoStore } from 'src/app/shared/crud/listado-store';
import { FILTROS_NOTIFICACION_VACIOS, FiltrosNotificacion, NotificacionSistema } from './notificacion-sistema';
import { NotificacionesRepositorio } from './notificaciones-repositorio';

/** Listado paginado de la página de notificaciones (las acciones van por `CentroNotificaciones`). */
@Injectable()
export class NotificacionesStore extends ListadoStore<NotificacionSistema, FiltrosNotificacion> {
  protected readonly repositorio = inject(NotificacionesRepositorio);

  constructor() {
    super(FILTROS_NOTIFICACION_VACIOS);
  }
}
