import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { AcudientesRepositorio } from 'src/app/personas/acudientes/acudientes-repositorio';
import { EstudiantesRepositorio } from 'src/app/personas/estudiantes/estudiantes-repositorio';
import { AccionesFormulario } from 'src/app/shared/acciones-formulario/acciones-formulario';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { PaginaCrud } from 'src/app/shared/crud/pagina-crud';
import { DialogoConfirmacion } from 'src/app/shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoListado } from 'src/app/shared/encabezado-listado/encabezado-listado';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { Cotizacion, FiltrosCotizacion } from './cotizacion';
import { CotizacionFormulario } from './cotizacion-formulario/cotizacion-formulario';
import { CotizacionesFiltros } from './cotizaciones-filtros/cotizaciones-filtros';
import { CotizacionesStore } from './cotizaciones-store';
import { CotizacionesTabla } from './cotizaciones-tabla/cotizaciones-tabla';

@Component({
  selector: 'app-cotizaciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CotizacionesFiltros, CotizacionesTabla, CotizacionFormulario, EncabezadoListado, AccionesFormulario, Modal, DialogoConfirmacion, Paginacion],
  providers: [CotizacionesStore],
  templateUrl: './cotizaciones-page.html',
})
export default class CotizacionesPage extends PaginaCrud<Cotizacion, FiltrosCotizacion> {
  protected readonly store = inject(CotizacionesStore);
  protected readonly titulos = { crear: 'Nueva cotización', editar: 'Editar cotización', consultar: 'Detalle de la cotización' };

  private readonly estudiantes = inject(EstudiantesRepositorio);
  protected readonly acudientes = toSignal(
    inject(AcudientesRepositorio).opciones().pipe(catchError(() => of<OpcionCatalogo[]>([]))),
    { initialValue: [] },
  );

  /** Estudiantes del acudiente elegido en el formulario. */
  protected readonly acudienteFormulario = signal('');
  protected readonly estudiantesAcudiente = toSignal(
    toObservable(this.acudienteFormulario).pipe(
      switchMap((acudienteId) =>
        acudienteId ? this.estudiantes.opciones({ acudienteId, estado: 'ACTIVO' }).pipe(catchError(() => of([]))) : of([]),
      ),
    ),
    { initialValue: [] },
  );

  protected describir(c: Cotizacion): string {
    return `la cotización ${c.numero} de ${c.nombreAcudiente}`;
  }
}
