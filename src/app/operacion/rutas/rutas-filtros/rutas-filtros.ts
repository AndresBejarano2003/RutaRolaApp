import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CatalogosService, OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_RUTA_VACIOS, FiltrosRuta } from '../ruta';

@Component({
  selector: 'app-rutas-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <h2 class="card-title text-base-content text-base"><i class="fa-solid fa-filter text-base-content/70"></i> Filtros</h2>
          <button type="button" class="btn btn-ghost btn-sm text-base-content/70" (click)="form.reset()">
            <i class="fa-solid fa-eraser"></i> Limpiar
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Código, nombre o sector..." aria-label="Buscar ruta" />
          </label>
          <app-selector-busqueda formControlName="colegioId" [opciones]="colegios()" textoTodos="Todos los colegios" etiqueta="Colegio" />
          <app-selector-busqueda formControlName="jornada" [opciones]="catalogos.jornadas" textoTodos="Todas las jornadas" etiqueta="Jornada" />
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
        </div>
      </div>
    </form>
  `,
})
export class RutasFiltros {
  readonly colegios = input<OpcionCatalogo[]>([]);
  readonly cambiar = output<FiltrosRuta>();
  protected readonly catalogos = inject(CatalogosService);
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_RUTA_VACIOS.texto,
    colegioId: FILTROS_RUTA_VACIOS.colegioId,
    jornada: FILTROS_RUTA_VACIOS.jornada,
    estado: FILTROS_RUTA_VACIOS.estado as EstadoRegistro | '',
    estudianteId: FILTROS_RUTA_VACIOS.estudianteId,
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
