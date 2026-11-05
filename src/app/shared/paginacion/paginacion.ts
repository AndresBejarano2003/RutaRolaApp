import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TAMANOS_PAGINA } from '../crud/crud-store';

type ElementoPagina = { tipo: 'pagina'; numero: number } | { tipo: 'salto'; clave: string };

/** Cuántas páginas mostrar a cada lado de la actual antes de usar "…". */
const VECINAS = 1;

@Component({
  selector: 'app-paginacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-base-300 text-sm"
      aria-label="Paginación">
      <p class="text-base-content/70">
        @if (total() > 0) {
          Mostrando <b class="text-base-content">{{ desde() }}–{{ hasta() }}</b> de
          <b class="text-base-content">{{ total() }}</b>
        } @else {
          Sin registros
        }
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <label class="flex items-center gap-2 text-base-content/70">
          <span class="hidden sm:inline">Filas por página</span>
          <select #selectorTamano class="select select-sm w-20 bg-base-100 border-neutral"
            (change)="cambiarTamano.emit(+selectorTamano.value)">
            @for (opcion of tamanos; track opcion) {
              <option [value]="opcion" [selected]="opcion === tamano()">{{ opcion }}</option>
            }
          </select>
        </label>

        <div class="flex items-center gap-1">
          <button type="button" class="btn btn-sm btn-square bg-base-300 border-neutral hover:bg-neutral"
            aria-label="Página anterior" [disabled]="pagina() <= 1" (click)="cambiarPagina.emit(pagina() - 1)">
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>

          @for (elemento of elementos(); track elemento.tipo === 'pagina' ? elemento.numero : elemento.clave) {
            @if (elemento.tipo === 'pagina') {
              @if (elemento.numero === pagina()) {
                <button type="button" class="btn btn-sm btn-primary min-w-9" aria-current="page">
                  {{ elemento.numero }}
                </button>
              } @else {
                <button type="button" class="btn btn-sm bg-base-300 border-neutral hover:bg-neutral min-w-9"
                  [attr.aria-label]="'Ir a la página ' + elemento.numero" (click)="cambiarPagina.emit(elemento.numero)">
                  {{ elemento.numero }}
                </button>
              }
            } @else {
              <span class="px-1 text-base-content/70" aria-hidden="true">…</span>
            }
          }

          <button type="button" class="btn btn-sm btn-square bg-base-300 border-neutral hover:bg-neutral"
            aria-label="Página siguiente" [disabled]="pagina() >= totalPaginas()" (click)="cambiarPagina.emit(pagina() + 1)">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class Paginacion {
  readonly pagina = input.required<number>();
  readonly tamano = input.required<number>();
  readonly total = input.required<number>();
  readonly totalPaginas = input.required<number>();

  readonly cambiarPagina = output<number>();
  readonly cambiarTamano = output<number>();

  protected readonly tamanos = TAMANOS_PAGINA;
  protected readonly desde = computed(() => (this.pagina() - 1) * this.tamano() + 1);
  protected readonly hasta = computed(() => Math.min(this.pagina() * this.tamano(), this.total()));

  /** Primera, última y las vecinas de la actual; el resto se resume con "…". */
  protected readonly elementos = computed<ElementoPagina[]>(() => {
    const actual = this.pagina();
    const ultima = this.totalPaginas();
    const resultado: ElementoPagina[] = [];
    for (let n = 1; n <= ultima; n++) {
      if (n === 1 || n === ultima || Math.abs(n - actual) <= VECINAS) {
        resultado.push({ tipo: 'pagina', numero: n });
      } else if (resultado.at(-1)?.tipo === 'pagina') {
        resultado.push({ tipo: 'salto', clave: `salto-${n}` });
      }
    }
    return resultado;
  });
}
