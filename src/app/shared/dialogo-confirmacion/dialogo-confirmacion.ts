import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Modal } from '../modal/modal';

/** Confirmación de acciones destructivas (eliminar, inactivar...) o aviso de por qué no se permiten. */
@Component({
  selector: 'app-dialogo-confirmacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  template: `
    <app-modal [(abierto)]="abierto" [titulo]="titulo()" ancho="max-w-md">
      <div class="flex gap-4 items-start">
        @if (permitirConfirmar()) {
          <div class="rounded-full bg-error/15 text-error w-12 h-12 shrink-0 grid place-items-center">
            <i class="fa-solid fa-triangle-exclamation text-xl"></i>
          </div>
        } @else {
          <div class="rounded-full bg-warning/15 text-warning w-12 h-12 shrink-0 grid place-items-center">
            <i class="fa-solid fa-ban text-xl"></i>
          </div>
        }
        <p class="text-base-content/90">{{ mensaje() }}</p>
      </div>
      <div pie class="flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" [disabled]="procesando()" (click)="abierto.set(false)">
          {{ permitirConfirmar() ? 'Cancelar' : 'Entendido' }}
        </button>
        @if (permitirConfirmar()) {
          <button type="button" class="btn btn-error" [disabled]="procesando()" (click)="confirmar.emit()">
            @if (procesando()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            {{ textoConfirmar() }}
          </button>
        }
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
  /** `false` cuando una regla de negocio impide la acción: solo se informa el motivo. */
  readonly permitirConfirmar = input(true);
  readonly confirmar = output<void>();
}
