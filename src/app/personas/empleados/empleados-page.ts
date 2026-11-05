import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccionesFormulario } from 'src/app/shared/acciones-formulario/acciones-formulario';
import { PaginaCrud } from 'src/app/shared/crud/pagina-crud';
import { DialogoConfirmacion } from 'src/app/shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoListado } from 'src/app/shared/encabezado-listado/encabezado-listado';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { nombreCompleto } from '../compartido/persona';
import { Empleado, FiltrosEmpleado, TIPOS_EMPLEADO } from './empleado';
import { EmpleadoFormulario } from './empleado-formulario/empleado-formulario';
import { EmpleadosFiltros } from './empleados-filtros/empleados-filtros';
import { EmpleadosStore } from './empleados-store';
import { EmpleadosTabla } from './empleados-tabla/empleados-tabla';

const TIPOS = new Map(TIPOS_EMPLEADO.map((t) => [t.id, t.nombre]));

@Component({
  selector: 'app-empleados-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmpleadosFiltros, EmpleadosTabla, EmpleadoFormulario, EncabezadoListado, AccionesFormulario, Modal, DialogoConfirmacion, Paginacion],
  providers: [EmpleadosStore],
  templateUrl: './empleados-page.html',
})
export default class EmpleadosPage extends PaginaCrud<Empleado, FiltrosEmpleado> {
  protected readonly store = inject(EmpleadosStore);
  protected readonly titulos = { crear: 'Nuevo empleado', editar: 'Editar empleado', consultar: 'Detalle del empleado' };

  protected describir(e: Empleado): string {
    return `${nombreCompleto(e)} · ${TIPOS.get(e.tipoEmpleado) ?? ''} (${e.tipoDocumento} ${e.numeroDocumento})`;
  }
}
