import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CentroNotificaciones } from 'src/app/inicio/notificaciones/centro-notificaciones';
import { NotificacionSistema, categoria, nivel, tiempoRelativo } from 'src/app/inicio/notificaciones/notificacion-sistema';

/**
 * Campana de la barra superior: conteo de no leídas (roja si hay críticas) y un panel con las
 * más recientes. Clic en una notificación → la marca leída y la abre expandida en el centro de
 * notificaciones (`/inicio/notificaciones?abrir=<id>`).
 */
@Component({
  selector: 'app-campana-notificaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'dropdown dropdown-end' },
  template: `
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle" [attr.aria-label]="etiqueta()">
      <div class="indicator">
        <i class="fa-solid fa-bell text-lg text-base-content/80"></i>
        @if (resumen().noLeidas > 0) {
          <span class="badge badge-xs indicator-item font-semibold" [class]="resumen().criticas ? 'badge-error' : 'badge-primary'">
            {{ resumen().noLeidas > 99 ? '99+' : resumen().noLeidas }}
          </span>
        }
      </div>
    </div>

    <div tabindex="0"
      class="dropdown-content z-50 mt-3 w-96 max-w-[calc(100vw-1rem)] max-sm:fixed max-sm:inset-x-2 max-sm:top-[calc(3.5rem+env(safe-area-inset-top))] max-sm:mt-1 max-sm:w-auto max-sm:max-w-none rounded-box bg-base-200 border border-base-300 shadow-2xl overflow-hidden">
      <header class="flex items-center justify-between gap-2 px-4 py-3 border-b border-base-300">
        <div class="min-w-0">
          <h2 class="font-bold text-base-content">Notificaciones</h2>
          <p class="text-xs text-base-content/70">
            @if (resumen().noLeidas) {
              {{ resumen().noLeidas }} sin leer
              @if (resumen().criticas) {
                · <span class="text-error font-medium">{{ resumen().criticas }} {{ resumen().criticas === 1 ? 'crítica' : 'críticas' }}</span>
              }
            } @else {
              Estás al día
            }
          </p>
        </div>
        @if (resumen().noLeidas) {
          <button type="button" class="btn btn-ghost btn-xs text-info" [disabled]="centro.procesando()" (click)="centro.marcarTodasLeidas()">
            <i class="fa-solid fa-check-double"></i>
            Marcar todas como leídas
          </button>
        }
      </header>

      @if (resumen().recientes.length) {
        <ul class="max-h-[min(26rem,60dvh)] overflow-y-auto divide-y divide-base-300">
          @for (n of resumen().recientes; track n.id) {
            @let niv = nivel(n.nivel);
            <li>
              <button type="button" class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-base-300/50 transition-colors"
                [class.bg-base-100]="!n.leida" (click)="abrir(n)">
                <span class="grid place-items-center size-9 shrink-0 rounded-full {{ niv.fondo }} {{ niv.texto }}">
                  <i [class]="categoria(n.categoria).icono"></i>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm truncate" [class]="n.leida ? 'text-base-content/80' : 'font-semibold text-base-content'">{{ n.titulo }}</span>
                  <span class="block text-xs text-base-content/70 line-clamp-2 mt-0.5">{{ n.mensaje }}</span>
                  <span class="block text-xs mt-1" [class]="n.nivel === 'CRITICA' ? 'text-error' : 'text-base-content/70'">
                    {{ tiempo(n.fecha) }}
                  </span>
                </span>
                @if (!n.leida) {
                  <span class="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" aria-label="Sin leer"></span>
                }
              </button>
            </li>
          }
        </ul>
      } @else {
        <div class="px-4 py-10 text-center">
          <i class="fa-regular fa-bell-slash text-3xl text-base-content/50"></i>
          <p class="text-sm text-base-content/70 mt-2">No tienes notificaciones nuevas.</p>
        </div>
      }

      <footer class="border-t border-base-300 p-2">
        <a routerLink="/inicio/notificaciones" class="btn btn-ghost btn-sm w-full text-info" (click)="cerrar()">
          Ver todas las notificaciones
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </footer>
    </div>
  `,
})
export class CampanaNotificaciones {
  protected readonly centro = inject(CentroNotificaciones);
  private readonly router = inject(Router);

  protected readonly resumen = this.centro.resumen;
  protected readonly categoria = categoria;
  protected readonly nivel = nivel;
  protected readonly etiqueta = computed(() => {
    const n = this.resumen().noLeidas;
    return n ? `Notificaciones (${n} sin leer)` : 'Notificaciones';
  });

  protected tiempo(fecha: string): string {
    return tiempoRelativo(fecha, this.centro.ahora());
  }

  protected abrir(n: NotificacionSistema): void {
    this.cerrar();
    if (!n.leida) void this.centro.marcarLeidas([n.id]);
    void this.router.navigate(['/inicio/notificaciones'], { queryParams: { abrir: n.id } });
  }

  /** El dropdown de DaisyUI se cierra al perder el foco. En teléfonos el panel es fijo y ocupa el ancho. */
  protected cerrar(): void {
    (document.activeElement as HTMLElement | null)?.blur();
  }
}
