import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccionesFormulario } from 'src/app/shared/acciones-formulario/acciones-formulario';
import { PaginaCrud } from 'src/app/shared/crud/pagina-crud';
import { DialogoConfirmacion } from 'src/app/shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoListado } from 'src/app/shared/encabezado-listado/encabezado-listado';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { Colegio, FiltrosColegio } from './colegio';
import { ColegioFormulario } from './colegio-formulario/colegio-formulario';
import { ColegiosFiltros } from './colegios-filtros/colegios-filtros';
import { ColegiosStore } from './colegios-store';
import { ColegiosTabla } from './colegios-tabla/colegios-tabla';

@Component({
  selector: 'app-colegios-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ColegiosFiltros, ColegiosTabla, ColegioFormulario, EncabezadoListado, AccionesFormulario, Modal, DialogoConfirmacion, Paginacion],
  providers: [ColegiosStore],
  templateUrl: './colegios-page.html',
})
export default class ColegiosPage extends PaginaCrud<Colegio, FiltrosColegio> {
  protected readonly store = inject(ColegiosStore);
  protected readonly titulos = { crear: 'Nuevo colegio', editar: 'Editar colegio', consultar: 'Detalle del colegio' };

  protected describir(colegio: Colegio): string {
    return `${colegio.razonSocial} (NIT ${colegio.nit})`;
  }
}
