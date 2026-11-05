import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_VEHICULO_VACIOS, FiltrosVehiculo, TIPOS_VEHICULO, TipoVehiculo } from '../vehiculo';

@Component({
  selector: 'app-vehiculos-filtros',
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label class="md:col-span-2 input input-bordered bg-base-100 border-neutral w-full flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-base-content/60"></i>
            <input type="search" formControlName="texto" class="grow" placeholder="Placa, número interno o marca..."
              aria-label="Buscar vehículo" />
          </label>
          <app-selector-busqueda formControlName="tipo" [opciones]="tipos" textoTodos="Todos los tipos" etiqueta="Tipo de vehículo" />
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
        </div>
      </div>
    </form>
  `,
})
export class VehiculosFiltros {
  readonly cambiar = output<FiltrosVehiculo>();
  protected readonly tipos = TIPOS_VEHICULO;
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_VEHICULO_VACIOS.texto,
    tipo: FILTROS_VEHICULO_VACIOS.tipo as TipoVehiculo | '',
    estado: FILTROS_VEHICULO_VACIOS.estado as EstadoRegistro | '',
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
