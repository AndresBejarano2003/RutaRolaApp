import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CatalogosService } from 'src/app/shared/catalogos/catalogos';
import { Estudiante, calcularEdad, nombreCompleto } from '../estudiante';

@Component({
  selector: 'app-estudiantes-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './estudiantes-tabla.html',
})
export class EstudiantesTabla {
  readonly estudiantes = input.required<Estudiante[]>();
  readonly cargando = input(false);
  readonly hayFiltros = input(false);

  readonly consultar = output<Estudiante>();
  readonly editar = output<Estudiante>();
  readonly eliminar = output<Estudiante>();
  readonly crear = output<void>();

  protected readonly catalogos = inject(CatalogosService);
  protected readonly nombreCompleto = nombreCompleto;
  protected readonly calcularEdad = calcularEdad;
  protected readonly filasEsqueleto = [1, 2, 3, 4, 5];
  protected readonly columnasEsqueleto = [1, 2, 3, 4, 5, 6, 7];
}
