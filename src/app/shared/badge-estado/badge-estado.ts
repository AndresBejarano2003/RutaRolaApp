import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EstadoRegistro } from '../crud/crud';

/**
 * Estado Activo / Inactivo con los colores estándar del sistema. Los textos
 * se pueden adaptar (p. ej. factura "Vigente" / "Anulada").
 */
@Component({
  selector: 'app-badge-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (estado() === 'ACTIVO') {
      <span class="badge badge-success badge-soft badge-sm gap-1 whitespace-nowrap">
        <i class="fa-solid fa-circle text-[6px]"></i> {{ textoActivo() }}
      </span>
    } @else {
      <span class="badge badge-sm bg-base-300 border-neutral text-base-content/70 gap-1 whitespace-nowrap">
        <i class="fa-solid fa-circle text-[6px]"></i> {{ textoInactivo() }}
      </span>
    }
  `,
})
export class BadgeEstado {
  readonly estado = input.required<EstadoRegistro>();
  readonly textoActivo = input('Activo');
  readonly textoInactivo = input('Inactivo');
}
