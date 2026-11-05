import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OpcionCatalogo } from '../catalogos/catalogos';
import { normalizar } from '../formularios/formularios';

let siguienteId = 0;

/** Alto máximo de la lista desplegable (`max-h-64` = 16rem). */
const ALTO_LISTA = 256;

/**
 * Lista de selección en la que se puede ESCRIBIR para buscar (combobox).
 * Reemplaza a `<select>` en filtros y formularios; funciona con
 * `formControlName` / `ngModel` como cualquier control.
 *
 * ```html
 * <app-selector-busqueda formControlName="colegioId" [opciones]="catalogos.colegios()"
 *   textoTodos="Todos los colegios" etiqueta="Colegio" />
 * ```
 *
 * Teclado: escribir filtra (sin tildes ni mayúsculas), ↑/↓ recorren,
 * Enter selecciona, Esc cierra.
 */
@Component({
  selector: 'app-selector-busqueda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectorBusqueda), multi: true }],
  host: { class: 'relative block', '(focusout)': 'alPerderFoco($event)' },
  template: `
    <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2"
      [class.input-error]="invalido()" [class.opacity-70]="deshabilitado()">
      <input #campo type="text" class="grow min-w-0" autocomplete="off" role="combobox"
        [attr.aria-label]="etiqueta() || null"
        [attr.aria-expanded]="abierto()"
        [attr.aria-controls]="idLista"
        [attr.aria-activedescendant]="abierto() && filtradas().length ? idLista + '-' + activo() : null"
        [placeholder]="seleccionada()?.nombre ?? textoTodos() ?? placeholder()"
        [value]="abierto() ? texto() : (seleccionada()?.nombre ?? '')"
        [disabled]="deshabilitado()"
        (focus)="abrir()"
        (click)="abrir()"
        (input)="escribir(campo.value)"
        (keydown)="alPresionarTecla($event)" />

      @if (valor() && textoTodos() !== null && !deshabilitado()) {
        <button type="button" tabindex="-1" class="btn btn-ghost btn-xs btn-circle" aria-label="Quitar selección"
          (mousedown)="$event.preventDefault()" (click)="seleccionar(opcionTodos())">
          <i class="fa-solid fa-xmark"></i>
        </button>
      }
      <i class="fa-solid fa-chevron-down text-xs text-base-content/70 transition-transform"
        [class.rotate-180]="abierto()"></i>
    </label>

    @if (abierto()) {
      <ul role="listbox" [id]="idLista"
        class="absolute z-30 w-full max-h-64 overflow-y-auto rounded-box bg-base-200 border border-base-300 shadow-xl py-1"
        [class]="haciaArriba() ? 'bottom-full mb-1' : 'top-full mt-1'">
        @for (opcion of filtradas(); track opcion.id; let i = $index) {
          @let elegida = opcion.id === valor();
          <li role="option" [id]="idLista + '-' + i" [attr.aria-selected]="elegida"
            class="px-3 py-2 cursor-pointer flex items-center justify-between gap-2"
            [class.bg-base-300]="i === activo()"
            [class.opacity-80]="opcion.id === ''"
            (mousedown)="$event.preventDefault()"
            (mouseenter)="activo.set(i)"
            (click)="seleccionar(opcion)">
            <span>{{ opcion.nombre }}</span>
            @if (elegida) {
              <i class="fa-solid fa-check text-primary text-xs"></i>
            }
          </li>
        } @empty {
          <li class="px-3 py-2 text-base-content/70">Sin resultados para "{{ texto() }}"</li>
        }
      </ul>
    }
  `,
})
export class SelectorBusqueda implements ControlValueAccessor {
  readonly opciones = input.required<OpcionCatalogo[]>();
  /** Si se indica, agrega una primera opción con valor `''` (p. ej. "Todos los colegios"). */
  readonly textoTodos = input<string | null>(null);
  readonly placeholder = input('Seleccionar...');
  /** Texto accesible (aria-label) cuando no hay `<label>` visible. */
  readonly etiqueta = input('');
  /** Marca el campo en rojo (p. ej. `[invalido]="!!error('campo')"`). */
  readonly invalido = input(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly idLista = `selector-busqueda-${siguienteId++}`;

  protected readonly valor = signal('');
  protected readonly texto = signal('');
  protected readonly abierto = signal(false);
  protected readonly activo = signal(0);
  protected readonly deshabilitado = signal(false);
  /** Se abre hacia arriba si no cabe debajo (p. ej. al final de un modal con scroll). */
  protected readonly haciaArriba = signal(false);

  protected readonly opcionTodos = computed<OpcionCatalogo>(() => ({ id: '', nombre: this.textoTodos() ?? '' }));
  protected readonly seleccionada = computed(() => this.opciones().find((o) => o.id === this.valor()) ?? null);
  protected readonly filtradas = computed(() => {
    const consulta = normalizar(this.texto());
    if (consulta) {
      return this.opciones().filter((o) => normalizar(o.nombre).includes(consulta));
    }
    return this.textoTodos() !== null ? [this.opcionTodos(), ...this.opciones()] : this.opciones();
  });

  private alCambiar: (valor: string) => void = () => {};
  private alTocar: () => void = () => {};

  // --- ControlValueAccessor ---
  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }
  registerOnChange(fn: (valor: string) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
    if (deshabilitado) {
      this.cerrar();
    }
  }

  // --- Interacción ---
  protected abrir(): void {
    if (this.deshabilitado() || this.abierto()) {
      return;
    }
    this.texto.set('');
    this.haciaArriba.set(this.faltaEspacioAbajo());
    this.abierto.set(true);
    const indice = this.filtradas().findIndex((o) => o.id === this.valor());
    this.activo.set(Math.max(0, indice));
  }

  protected escribir(texto: string): void {
    this.texto.set(texto);
    this.abierto.set(true);
    this.activo.set(0);
  }

  protected seleccionar(opcion: OpcionCatalogo | undefined): void {
    if (!opcion) {
      return;
    }
    if (opcion.id !== this.valor()) {
      this.valor.set(opcion.id);
      this.alCambiar(opcion.id);
    }
    this.cerrar();
  }

  protected alPresionarTecla(evento: KeyboardEvent): void {
    const total = this.filtradas().length;
    switch (evento.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        evento.preventDefault();
        if (!this.abierto()) {
          this.abrir();
          return;
        }
        if (total) {
          const paso = evento.key === 'ArrowDown' ? 1 : -1;
          this.activo.update((i) => (i + paso + total) % total);
          this.mostrarActivo();
        }
        break;
      case 'Enter':
        if (this.abierto()) {
          evento.preventDefault();
          this.seleccionar(this.filtradas()[this.activo()]);
        }
        break;
      case 'Escape':
        if (this.abierto()) {
          evento.preventDefault();
          evento.stopPropagation(); // no cerrar el modal que lo contiene
          this.cerrar();
        }
        break;
    }
  }

  protected alPerderFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (!destino || !this.host.nativeElement.contains(destino)) {
      this.cerrar();
      this.alTocar();
    }
  }

  private cerrar(): void {
    this.abierto.set(false);
    this.texto.set('');
  }

  /** Compara el espacio libre arriba/abajo dentro del contenedor con scroll más cercano. */
  private faltaEspacioAbajo(): boolean {
    const host = this.host.nativeElement;
    let contenedor = host.parentElement;
    while (contenedor && !/(auto|scroll)/.test(getComputedStyle(contenedor).overflowY)) {
      contenedor = contenedor.parentElement;
    }
    const limite = contenedor?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight };
    const caja = host.getBoundingClientRect();
    const abajo = limite.bottom - caja.bottom;
    const arriba = caja.top - limite.top;
    return abajo < ALTO_LISTA && arriba > abajo;
  }

  private mostrarActivo(): void {
    queueMicrotask(() =>
      this.host.nativeElement
        .querySelector(`#${this.idLista}-${this.activo()}`)
        ?.scrollIntoView({ block: 'nearest' }),
    );
  }
}
