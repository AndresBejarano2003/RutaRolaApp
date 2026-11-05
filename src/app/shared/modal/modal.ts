import { ChangeDetectionStrategy, Component, ElementRef, effect, input, model, viewChild } from '@angular/core';

/**
 * Ventana modal (DaisyUI `<dialog>`) con tres zonas:
 * encabezado FIJO, cuerpo con SCROLL interno y pie FIJO para los botones.
 *
 * ```html
 * <app-modal [(abierto)]="modalAbierto" titulo="Nuevo registro">
 *   @if (modalAbierto()) {
 *     <app-x-formulario idFormulario="form-x" ... />            ← cuerpo (hace scroll)
 *     <app-acciones-formulario pie formulario="form-x" ... />   ← pie (siempre visible)
 *   }
 * </app-modal>
 * ```
 * Todo lo que tenga el atributo `pie` va al pie; el resto, al cuerpo.
 * Envolver el contenido en `@if` hace que el formulario se cree limpio cada vez.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialogo class="modal modal-bottom sm:modal-middle" (close)="abierto.set(false)">
      <div class="modal-box bg-base-200 border border-base-300 text-base-content w-full p-0 flex flex-col overflow-hidden max-h-[calc(100dvh-2rem)]"
        [class]="ancho()">
        <header class="shrink-0 flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-base-300">
          <div>
            <h3 class="font-bold text-2xl">{{ titulo() }}</h3>
            @if (subtitulo()) {
              <p class="text-sm text-base-content/70 mt-1">{{ subtitulo() }}</p>
            }
          </div>
          <button type="button" class="btn btn-sm btn-circle btn-ghost" aria-label="Cerrar" (click)="cerrar()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
          <ng-content />
        </div>

        <footer class="shrink-0 px-6 py-4 border-t border-base-300 bg-base-200 empty:hidden">
          <ng-content select="[pie]" />
        </footer>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="submit" aria-label="Cerrar">cerrar</button>
      </form>
    </dialog>
  `,
})
export class Modal {
  readonly abierto = model(false);
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  /** Clase de ancho de DaisyUI/Tailwind, p. ej. `max-w-5xl`. */
  readonly ancho = input('max-w-2xl');

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.abierto() && !dialogo.open) {
        dialogo.showModal();
      } else if (!this.abierto() && dialogo.open) {
        dialogo.close();
      }
    });
  }

  cerrar(): void {
    this.abierto.set(false);
  }
}
