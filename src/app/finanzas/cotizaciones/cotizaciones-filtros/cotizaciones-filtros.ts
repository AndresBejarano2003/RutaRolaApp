import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { ESTADOS_COTIZACION, EstadoCotizacion, FILTROS_COTIZACION_VACIOS, FiltrosCotizacion } from '../cotizacion';

@Component({
  selector: 'app-cotizaciones-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <app-panel-filtros (limpiar)="form.reset()">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Número, acudiente o estudiante..." aria-label="Buscar cotización" />
          </label>
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <span class="text-base-content/70 text-sm">Desde</span>
            <input type="date" formControlName="desde" class="grow" aria-label="Fecha desde" />
          </label>
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <span class="text-base-content/70 text-sm">Hasta</span>
            <input type="date" formControlName="hasta" class="grow" aria-label="Fecha hasta" />
          </label>
        </div>
      </app-panel-filtros>
    </form>
  `,
})
export class CotizacionesFiltros {
  readonly cambiar = output<FiltrosCotizacion>();
  protected readonly estados = ESTADOS_COTIZACION;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_COTIZACION_VACIOS.texto,
    estado: FILTROS_COTIZACION_VACIOS.estado as EstadoCotizacion | '',
    desde: FILTROS_COTIZACION_VACIOS.desde,
    hasta: FILTROS_COTIZACION_VACIOS.hasta,
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
