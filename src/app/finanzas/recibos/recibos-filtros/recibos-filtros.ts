import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { ESTADOS_RECIBO, FILTROS_RECIBO_VACIOS, FiltrosRecibo, MEDIOS_PAGO, MedioPago } from '../recibo';

@Component({
  selector: 'app-recibos-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <app-panel-filtros (limpiar)="form.reset()">
        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2 xl:col-span-1 md:col-span-3">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Recibo, factura, acudiente..." aria-label="Buscar recibo" />
          </label>
          <app-selector-busqueda formControlName="medioPago" [opciones]="medios" textoTodos="Todos los medios" etiqueta="Medio de pago" />
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <span class="text-base-content/70 text-sm">Desde</span>
            <input type="date" formControlName="desde" class="grow" aria-label="Pagado desde" />
          </label>
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <span class="text-base-content/70 text-sm">Hasta</span>
            <input type="date" formControlName="hasta" class="grow" aria-label="Pagado hasta" />
          </label>
        </div>
      </app-panel-filtros>
    </form>
  `,
})
export class RecibosFiltros {
  readonly cambiar = output<FiltrosRecibo>();
  protected readonly medios = MEDIOS_PAGO;
  protected readonly estados = ESTADOS_RECIBO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_RECIBO_VACIOS.texto,
    facturaId: FILTROS_RECIBO_VACIOS.facturaId,
    medioPago: FILTROS_RECIBO_VACIOS.medioPago as MedioPago | '',
    estado: FILTROS_RECIBO_VACIOS.estado as EstadoRegistro | '',
    desde: FILTROS_RECIBO_VACIOS.desde,
    hasta: FILTROS_RECIBO_VACIOS.hasta,
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
