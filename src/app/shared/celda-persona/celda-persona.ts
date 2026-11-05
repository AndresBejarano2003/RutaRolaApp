import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Celda de tabla con avatar de iniciales, nombre y un detalle opcional debajo. */
@Component({
  selector: 'app-celda-persona',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center gap-3' },
  template: `
    <div class="avatar avatar-placeholder">
      <div class="w-9 rounded-full text-xs font-bold"
        [class]="activo() ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/70'">
        {{ iniciales() }}
      </div>
    </div>
    <div class="min-w-0">
      <div class="font-semibold text-base-content truncate">{{ nombre() }}</div>
      @if (detalle()) {
        <div class="text-xs text-base-content/70 truncate">{{ detalle() }}</div>
      }
    </div>
  `,
})
export class CeldaPersona {
  readonly nombre = input.required<string>();
  readonly iniciales = input.required<string>();
  readonly detalle = input('');
  readonly activo = input(true);
}
