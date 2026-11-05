import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OpcionCatalogo } from '../catalogos/catalogos';
import { SelectorBusqueda } from '../selector-busqueda/selector-busqueda';

/**
 * Selección MÚLTIPLE (valor: `string[]` de ids): se busca en un
 * `<app-selector-busqueda>`, se pulsa "Agregar" y la opción pasa a la lista,
 * de donde se puede quitar. Deshabilitado (consulta) solo muestra la lista.
 *
 * ```html
 * <app-lista-seleccion formControlName="estudianteIds" [opciones]="estudiantes()" etiqueta="Estudiante" />
 * ```
 */
@Component({
  selector: 'app-lista-seleccion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SelectorBusqueda],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ListaSeleccion), multi: true }],
  host: { class: 'block' },
  template: `
    @if (!deshabilitado()) {
      <div class="flex gap-2 mb-3">
        <app-selector-busqueda class="flex-1" [opciones]="disponibles()" [etiqueta]="etiqueta()" [placeholder]="placeholder()"
          [ngModel]="elegido()" (ngModelChange)="elegido.set($event)" />
        <button type="button" class="btn btn-secondary" [disabled]="!elegido()" (click)="agregar()">
          <i class="fa-solid fa-plus"></i> Agregar
        </button>
      </div>
    }
    @if (seleccion().length) {
      <ul class="divide-y divide-base-300 rounded-box border border-base-300">
        @for (item of seleccion(); track item.id; let i = $index) {
          <li class="flex items-center justify-between gap-3 px-3 py-2">
            <span><span class="text-base-content/70 mr-2">{{ i + 1 }}.</span>{{ item.nombre }}</span>
            @if (!deshabilitado()) {
              <button type="button" class="btn btn-ghost btn-sm btn-square text-error" [attr.aria-label]="'Quitar ' + item.nombre"
                (click)="quitar(item.id)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }
          </li>
        }
      </ul>
    } @else {
      <p class="text-sm text-base-content/70 py-2"><i class="fa-solid fa-circle-info text-info"></i> {{ textoVacio() }}</p>
    }
  `,
})
export class ListaSeleccion implements ControlValueAccessor {
  readonly opciones = input.required<OpcionCatalogo[]>();
  readonly etiqueta = input('Opción');
  readonly placeholder = input('Buscar para agregar...');
  readonly textoVacio = input('No hay elementos en la lista.');

  protected readonly ids = signal<string[]>([]);
  protected readonly elegido = signal('');
  protected readonly deshabilitado = signal(false);

  protected readonly disponibles = computed(() => this.opciones().filter((o) => !this.ids().includes(o.id)));
  protected readonly seleccion = computed(() => {
    const nombres = new Map(this.opciones().map((o) => [o.id, o.nombre]));
    return this.ids().map((id) => ({ id, nombre: nombres.get(id) ?? 'Registro no disponible' }));
  });

  private alCambiar: (valor: string[]) => void = () => {};
  private alTocar: () => void = () => {};

  writeValue(valor: string[] | null): void {
    this.ids.set(valor ?? []);
  }
  registerOnChange(fn: (valor: string[]) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  protected agregar(): void {
    const id = this.elegido();
    if (id && !this.ids().includes(id)) {
      this.actualizar([...this.ids(), id]);
    }
    this.elegido.set('');
  }

  protected quitar(id: string): void {
    this.actualizar(this.ids().filter((i) => i !== id));
  }

  private actualizar(ids: string[]): void {
    this.ids.set(ids);
    this.alCambiar(ids);
    this.alTocar();
  }
}
