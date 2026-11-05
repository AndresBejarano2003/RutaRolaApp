import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeEstado } from 'src/app/shared/badge-estado/badge-estado';
import { CeldaPersona } from 'src/app/shared/celda-persona/celda-persona';
import { iniciales, nombreCompleto } from '../../compartido/persona';
import { Acudiente } from '../acudiente';

@Component({
  selector: 'app-acudientes-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CeldaPersona, BadgeEstado],
  templateUrl: './acudientes-tabla.html',
})
export class AcudientesTabla {
  readonly acudientes = input.required<Acudiente[]>();
  readonly cargando = input(false);
  readonly hayFiltros = input(false);

  readonly consultar = output<Acudiente>();
  readonly editar = output<Acudiente>();
  readonly eliminar = output<Acudiente>();
  readonly verEstudiantes = output<Acudiente>();
  readonly crear = output<void>();

  protected readonly nombreCompleto = nombreCompleto;
  protected readonly iniciales = iniciales;
  protected readonly filasEsqueleto = [1, 2, 3, 4, 5];
  protected readonly columnasEsqueleto = [1, 2, 3, 4, 5, 6];
}
