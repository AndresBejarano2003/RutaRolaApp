import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_PROGRAMACION_VACIOS, FiltrosProgramacion } from '../programacion';

@Component({
  selector: 'app-programaciones-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <app-panel-filtros (limpiar)="form.reset()">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Nombre o número de factura..." aria-label="Buscar programación" />
          </label>
          <app-selector-busqueda formControlName="facturaId" [opciones]="facturas()" textoTodos="Todas las facturas" etiqueta="Factura" />
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
        </div>
      </app-panel-filtros>
    </form>
  `,
})
export class ProgramacionesFiltros {
  readonly facturas = input<OpcionCatalogo[]>([]);
  readonly cambiar = output<FiltrosProgramacion>();
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_PROGRAMACION_VACIOS.texto,
    facturaId: FILTROS_PROGRAMACION_VACIOS.facturaId,
    estado: FILTROS_PROGRAMACION_VACIOS.estado as EstadoRegistro | '',
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
