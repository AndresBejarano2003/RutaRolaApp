import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificacionesService, TipoNotificacion } from './notificaciones';

const ESTILOS: Record<TipoNotificacion, { clase: string; icono: string }> = {
  exito: { clase: 'alert-success', icono: 'fa-solid fa-circle-check' },
  error: { clase: 'alert-error', icono: 'fa-solid fa-circle-exclamation' },
  info: { clase: 'alert-info', icono: 'fa-solid fa-circle-info' },
};

@Component({
  selector: 'app-notificaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast toast-top toast-end z-[1000] mt-14">
      @for (notificacion of servicio.lista(); track notificacion.id) {
        @let estilo = estilos[notificacion.tipo];
        <div role="alert" class="alert shadow-lg text-sm max-w-sm" [class]="estilo.clase">
          <i [class]="estilo.icono"></i>
          <span>{{ notificacion.mensaje }}</span>
          <button type="button" class="btn btn-ghost btn-xs btn-circle" aria-label="Cerrar"
            (click)="servicio.cerrar(notificacion.id)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class ContenedorNotificaciones {
  protected readonly servicio = inject(NotificacionesService);
  protected readonly estilos = ESTILOS;
}
