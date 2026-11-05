import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_COLEGIO_VACIOS, FiltrosColegio } from '../colegio';

@Component({
  selector: 'app-colegios-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <app-panel-filtros (limpiar)="form.reset()">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="md:col-span-2 input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Razón social o NIT..."
              aria-label="Buscar por razón social o NIT" />
          </label>
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
        </div>
      </app-panel-filtros>
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
