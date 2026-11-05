import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Estado vacío de un listado: ícono + mensaje. Sin filtros activos ofrece
 * el botón de crear (si `textoCrear` no está vacío).
 */
@Component({
  selector: 'app-estado-vacio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col items-center gap-3 py-12 text-center' },
  template: `
    <div class="rounded-full bg-base-300 w-16 h-16 grid place-items-center">
      <i class="text-2xl text-base-content/70" [class]="icono()"></i>
    </div>
    @if (hayFiltros()) {
      <p class="font-semibold">Ningún registro coincide con los filtros.</p>
      <p class="text-sm text-base-content/70">Prueba con otros criterios o limpia los filtros.</p>
    } @else {
      <p class="font-semibold">{{ mensaje() }}</p>
      @if (textoCrear()) {
        <button type="button" class="btn btn-primary btn-sm" (click)="crear.emit()">
          <i class="fa-solid fa-plus"></i>
          {{ textoCrear() }}
        </button>
      }
    }
  `,
})
export class EstadoVacio {
  readonly icono = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly hayFiltros = input(false);
  readonly textoCrear = input('Registrar el primero');
  readonly crear = output<void>();
}
