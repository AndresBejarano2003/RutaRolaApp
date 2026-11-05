import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

/**
 * Acciones estándar de una fila: Consultar (info), Editar (primary) y
 * Eliminar (error), con tooltip. Botones extra se proyectan antes.
 * El clic no se propaga a la fila (que abre la consulta).
 */
@Component({
  selector: 'app-acciones-fila',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex gap-1', '(click)': '$event.stopPropagation()' },
  template: `
    <ng-content />
    <div class="tooltip" data-tip="Consultar">
      <button type="button" class="btn btn-sm btn-ghost btn-square text-info hover:bg-info/15" aria-label="Consultar"
        (click)="consultar.emit()">
        <i class="fa-solid fa-eye"></i>
      </button>
    </div>
    @if (editable()) {
      <div class="tooltip" data-tip="Editar">
        <button type="button" class="btn btn-sm btn-ghost btn-square text-primary hover:bg-primary/15" aria-label="Editar"
          (click)="editar.emit()">
          <i class="fa-solid fa-pen"></i>
        </button>
      </div>
    }
    @if (eliminable()) {
      <div class="tooltip tooltip-left" data-tip="Eliminar">
        <button type="button" class="btn btn-sm btn-ghost btn-square text-error hover:bg-error/15" aria-label="Eliminar"
          (click)="eliminar.emit()">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    }
  `,
})
export class AccionesFila {
  readonly editable = input(true, { transform: booleanAttribute });
  readonly eliminable = input(true, { transform: booleanAttribute });
  readonly consultar = output<void>();
  readonly editar = output<void>();
  readonly eliminar = output<void>();
}
