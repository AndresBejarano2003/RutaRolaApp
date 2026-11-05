import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Modal } from '../modal/modal';

/** Confirmación de acciones destructivas (eliminar, inactivar...). */
@Component({
  selector: 'app-dialogo-confirmacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  template: `
    <app-modal [(abierto)]="abierto" [titulo]="titulo()" ancho="max-w-md">
      <div class="flex gap-4 items-start">
        <div class="rounded-full bg-error/15 text-error w-12 h-12 shrink-0 grid place-items-center">
          <i class="fa-solid fa-triangle-exclamation text-xl"></i>
        </div>
        <p class="text-base-content/90">{{ mensaje() }}</p>
      </div>
      <div pie class="flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" [disabled]="procesando()" (click)="abierto.set(false)">
          Cancelar
        </button>
        <button type="button" class="btn btn-error" [disabled]="procesando()" (click)="confirmar.emit()">
          @if (procesando()) {
            <span class="loading loading-spinner loading-sm"></span>
          }
          {{ textoConfirmar() }}
        </button>
      </div>
    </app-modal>
  `,
})
export class DialogoConfirmacion {
  readonly abierto = model(false);
  readonly titulo = input('¿Estás seguro?');
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Eliminar');
  readonly procesando = input(false);
  readonly confirmar = output<void>();
}
