import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * Envoltura estándar de un campo de formulario: etiqueta, marca de
 * obligatorio, el control proyectado y el error (o una ayuda) debajo.
 *
 * ```html
 * <label app-campo etiqueta="NIT" requerido [error]="error('nit')">
 *   <input formControlName="nit" class="input ..." />
 * </label>
 *
 * <!-- Con <app-selector-busqueda> se usa <div>, no <label> -->
 * <div app-campo etiqueta="Colegio" requerido [error]="error('colegioId')">
 *   <app-selector-busqueda formControlName="colegioId" ... />
 * </div>
 * ```
 */
@Component({
  selector: '[app-campo]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col w-full' },
  template: `
    <span class="label-text text-base-content/90 mb-1">
      {{ etiqueta() }}
      @if (requerido()) {
        <span class="text-error">*</span>
      }
    </span>
    <ng-content />
    @if (error(); as mensaje) {
      <span class="text-xs text-error mt-1">{{ mensaje }}</span>
    } @else if (ayuda()) {
      <span class="text-xs text-base-content/70 mt-1">{{ ayuda() }}</span>
    }
  `,
})
export class Campo {
  readonly etiqueta = input.required<string>();
  readonly requerido = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);
  readonly ayuda = input('');
}

/** Título de sección dentro de un formulario de dos columnas. */
@Component({
  selector: 'app-titulo-seccion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'md:col-span-2 text-sm font-semibold uppercase tracking-wide text-info mt-2 border-b border-base-300 pb-1 block',
    role: 'heading',
    'aria-level': '4',
  },
  template: `<ng-content />`,
})
export class TituloSeccion {}
