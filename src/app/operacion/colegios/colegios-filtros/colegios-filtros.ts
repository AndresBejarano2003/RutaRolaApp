import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_COLEGIO_VACIOS, FiltrosColegio } from '../colegio';

@Component({
  selector: 'app-colegios-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <h2 class="card-title text-base-content text-base">
            <i class="fa-solid fa-filter text-base-content/70"></i> Filtros
          </h2>
          <button type="button" class="btn btn-ghost btn-sm text-base-content/70" (click)="form.reset()">
            <i class="fa-solid fa-eraser"></i> Limpiar
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="md:col-span-2 input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Razón social o NIT..."
              aria-label="Buscar por razón social o NIT" />
          </label>
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
        </div>
      </div>
    </form>
  `,
})
export class ColegiosFiltros {
  readonly cambiar = output<FiltrosColegio>();
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_COLEGIO_VACIOS.texto,
    estado: FILTROS_COLEGIO_VACIOS.estado as EstadoRegistro | '',
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
