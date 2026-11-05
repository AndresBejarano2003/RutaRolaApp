import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccionesFormulario } from 'src/app/shared/acciones-formulario/acciones-formulario';
import { PaginaCrud } from 'src/app/shared/crud/pagina-crud';
import { DialogoConfirmacion } from 'src/app/shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoListado } from 'src/app/shared/encabezado-listado/encabezado-listado';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { FiltrosVehiculo, Vehiculo } from './vehiculo';
import { VehiculoFormulario } from './vehiculo-formulario/vehiculo-formulario';
import { VehiculosFiltros } from './vehiculos-filtros/vehiculos-filtros';
import { VehiculosStore } from './vehiculos-store';
import { VehiculosTabla } from './vehiculos-tabla/vehiculos-tabla';

@Component({
  selector: 'app-vehiculos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VehiculosFiltros, VehiculosTabla, VehiculoFormulario, EncabezadoListado, AccionesFormulario, Modal, DialogoConfirmacion, Paginacion],
  providers: [VehiculosStore],
  templateUrl: './vehiculos-page.html',
})
export default class VehiculosPage extends PaginaCrud<Vehiculo, FiltrosVehiculo> {
  protected readonly store = inject(VehiculosStore);
  protected readonly titulos = { crear: 'Nuevo vehículo', editar: 'Editar vehículo', consultar: 'Detalle del vehículo' };

  protected describir(v: Vehiculo): string {
    return `el vehículo ${v.placa} (interno ${v.numeroInterno})`;
  }
}
