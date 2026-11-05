import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { ColegiosRepositorio } from 'src/app/operacion/colegios/colegios-repositorio';
import { Curso } from 'src/app/operacion/colegios/colegio';
import { AccionesFormulario } from 'src/app/shared/acciones-formulario/acciones-formulario';
import { OpcionCatalogo, aMapa } from 'src/app/shared/catalogos/catalogos';
import { PaginaCrud } from 'src/app/shared/crud/pagina-crud';
import { DialogoConfirmacion } from 'src/app/shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoListado } from 'src/app/shared/encabezado-listado/encabezado-listado';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { AcudientesRepositorio } from '../acudientes/acudientes-repositorio';
import { nombreCompleto } from '../compartido/persona';
import { Estudiante, FiltrosEstudiante } from './estudiante';
import { EstudianteFormulario } from './estudiante-formulario/estudiante-formulario';
import { EstudiantesFiltros } from './estudiantes-filtros/estudiantes-filtros';
import { EstudiantesStore } from './estudiantes-store';
import { EstudiantesTabla } from './estudiantes-tabla/estudiantes-tabla';

@Component({
  selector: 'app-estudiantes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstudiantesFiltros, EstudiantesTabla, EstudianteFormulario, EncabezadoListado, AccionesFormulario, Modal, DialogoConfirmacion, Paginacion],
  providers: [EstudiantesStore],
  templateUrl: './estudiantes-page.html',
})
export default class EstudiantesPage extends PaginaCrud<Estudiante, FiltrosEstudiante> {
  protected readonly store = inject(EstudiantesStore);
  protected readonly titulos = { crear: 'Nuevo estudiante', editar: 'Editar estudiante', consultar: 'Detalle del estudiante' };

  private readonly colegiosRepo = inject(ColegiosRepositorio);

  /** Acudientes y colegios vienen de sus módulos (no de catálogos fijos). */
  protected readonly acudientes = toSignal(inject(AcudientesRepositorio).opciones().pipe(catchError(() => of<OpcionCatalogo[]>([]))), {
    initialValue: [],
  });
  protected readonly nombresAcudiente = computed(() => aMapa(this.acudientes()));
  protected readonly colegios = toSignal(this.colegiosRepo.opciones().pipe(catchError(() => of<OpcionCatalogo[]>([]))), {
    initialValue: [],
  });
  protected readonly nombresColegio = computed(() => aMapa(this.colegios()));

  /** Cursos del colegio elegido en el formulario: definen los grados disponibles. */
  protected readonly colegioFormulario = signal('');
  protected readonly cursos = toSignal(
    toObservable(this.colegioFormulario).pipe(
      switchMap((id) =>
        id
          ? this.colegiosRepo.obtener(id).pipe(
              map((c): Curso[] | null => c.cursos),
              catchError(() => of(null)),
            )
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  protected describir(e: Estudiante): string {
    return `${nombreCompleto(e)} (${e.tipoDocumento} ${e.numeroDocumento})`;
  }
}
