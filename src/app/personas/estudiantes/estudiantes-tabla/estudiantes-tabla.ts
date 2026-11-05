import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeEstado } from 'src/app/shared/badge-estado/badge-estado';
import { CeldaPersona } from 'src/app/shared/celda-persona/celda-persona';
import { iniciales, nombreCompleto } from '../../compartido/persona';
import { Estudiante, calcularEdad } from '../estudiante';

@Component({
  selector: 'app-estudiantes-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CeldaPersona, BadgeEstado],
  templateUrl: './estudiantes-tabla.html',
})
export class EstudiantesTabla {
  readonly estudiantes = input.required<Estudiante[]>();
  readonly cargando = input(false);
  readonly hayFiltros = input(false);
  /** id → nombre del acudiente (del módulo de acudientes). */
  readonly nombresColegio = input<ReadonlyMap<string, string>>(new Map());
  readonly nombresAcudiente = input<ReadonlyMap<string, string>>(new Map());

  readonly consultar = output<Estudiante>();
  readonly editar = output<Estudiante>();
  readonly eliminar = output<Estudiante>();
  readonly crear = output<void>();

  protected readonly nombreCompleto = nombreCompleto;
  protected readonly iniciales = iniciales;
  protected readonly calcularEdad = calcularEdad;
  protected readonly filasEsqueleto = [1, 2, 3, 4, 5];
  protected readonly columnasEsqueleto = [1, 2, 3, 4, 5, 6, 7];
}
