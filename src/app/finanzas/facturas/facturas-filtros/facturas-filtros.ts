import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { ESTADOS_FACTURA, FILTROS_FACTURA_VACIOS, FiltrosFactura } from '../factura';

@Component({
  selector: 'app-facturas-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <app-panel-filtros (limpiar)="form.reset()">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Número, acudiente o estudiante..." aria-label="Buscar factura" />
          </label>
          <app-selector-busqueda formControlName="acudienteId" [opciones]="acudientes()" textoTodos="Todos los acudientes" etiqueta="Acudiente" />
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
        </div>
      </app-panel-filtros>
    </form>
  `,
})
export class FacturasFiltros {
  readonly acudientes = input<OpcionCatalogo[]>([]);
  readonly cambiar = output<FiltrosFactura>();
  protected readonly estados = ESTADOS_FACTURA;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_FACTURA_VACIOS.texto,
    acudienteId: FILTROS_FACTURA_VACIOS.acudienteId,
    estudianteId: FILTROS_FACTURA_VACIOS.estudianteId,
    estado: FILTROS_FACTURA_VACIOS.estado as EstadoRegistro | '',
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
