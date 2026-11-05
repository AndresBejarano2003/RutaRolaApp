import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/**
 * Cuerpo de la tarjeta de filtros: título "Filtros", botón Limpiar y los campos.
 * En teléfonos (vertical u horizontal) los campos se pliegan para que el listado quede a la vista;
 * desde tablet siempre están visibles.
 *
 * ```html
 * <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
 *   <app-panel-filtros (limpiar)="form.reset()">
 *     <div class="grid grid-cols-1 md:grid-cols-3 gap-4">…</div>
 *   </app-panel-filtros>
 * </form>
 * ```
 */
@Component({
  selector: 'app-panel-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card-body' },
  template: `
    <div class="flex items-center justify-between gap-2">
      <button type="button" class="card-title text-base-content text-base cursor-pointer amplio:cursor-default"
        [attr.aria-expanded]="abierto()" (click)="abierto.set(!abierto())">
        <i class="fa-solid fa-filter text-base-content/70"></i> Filtros
        <span class="amplio:hidden"><i class="fa-solid fa-chevron-down text-xs text-base-content/70 transition-transform" [class.rotate-180]="abierto()"></i></span>
      </button>
      <button type="button" class="btn btn-ghost btn-sm text-base-content/70" (click)="limpiar.emit()">
        <i class="fa-solid fa-eraser"></i> {{ textoLimpiar() }}
      </button>
    </div>
    <div class="amplio:block space-y-3" [class.hidden]="!abierto()">
      <ng-content />
    </div>
  `,
})
export class PanelFiltros {
  readonly textoLimpiar = input('Limpiar');
  readonly limpiar = output<void>();
  protected readonly abierto = signal(false);
}
