import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_ASIGNACION_VACIOS, FiltrosAsignacion } from '../asignacion';

@Component({
  selector: 'app-asignaciones-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, SelectorBusqueda],
  template: `
    <form [formGroup]="form" class="card bg-base-200 border border-base-300 shadow-xl">
      <app-panel-filtros (limpiar)="form.reset()">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <app-selector-busqueda formControlName="rutaId" [opciones]="rutas()" textoTodos="Todas las rutas" etiqueta="Ruta" />
          <app-selector-busqueda formControlName="vehiculoId" [opciones]="vehiculos()" textoTodos="Todos los vehículos" etiqueta="Vehículo" />
          <app-selector-busqueda formControlName="empleadoId" [opciones]="empleados()" textoTodos="Todo el personal" etiqueta="Conductor o monitora" />
          <app-selector-busqueda formControlName="estado" [opciones]="estados" textoTodos="Todos los estados" etiqueta="Estado" />
        </div>
      </app-panel-filtros>
    </form>
  `,
})
export class AsignacionesFiltros {
  readonly rutas = input<OpcionCatalogo[]>([]);
  readonly vehiculos = input<OpcionCatalogo[]>([]);
  readonly empleados = input<OpcionCatalogo[]>([]);
  readonly cambiar = output<FiltrosAsignacion>();
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    rutaId: FILTROS_ASIGNACION_VACIOS.rutaId,
    vehiculoId: FILTROS_ASIGNACION_VACIOS.vehiculoId,
    empleadoId: FILTROS_ASIGNACION_VACIOS.empleadoId,
    estado: FILTROS_ASIGNACION_VACIOS.estado as EstadoRegistro | '',
  });

  constructor() {
    emitirEnVivo(this.form, this.cambiar);
  }
}
