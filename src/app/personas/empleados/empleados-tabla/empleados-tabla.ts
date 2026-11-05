import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeEstado } from 'src/app/shared/badge-estado/badge-estado';
import { CeldaPersona } from 'src/app/shared/celda-persona/celda-persona';
import { aMapa } from 'src/app/shared/catalogos/catalogos';
import { iniciales, nombreCompleto } from '../../compartido/persona';
import { Empleado, TIPOS_CONTRATO, TIPOS_EMPLEADO, estadoLicencia } from '../empleado';

@Component({
  selector: 'app-empleados-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CeldaPersona, BadgeEstado, CurrencyPipe],
  templateUrl: './empleados-tabla.html',
})
export class EmpleadosTabla {
  readonly empleados = input.required<Empleado[]>();
  readonly cargando = input(false);
  readonly hayFiltros = input(false);

  readonly consultar = output<Empleado>();
  readonly editar = output<Empleado>();
  readonly eliminar = output<Empleado>();
  readonly crear = output<void>();

  protected readonly nombreCompleto = nombreCompleto;
  protected readonly iniciales = iniciales;
  protected readonly estadoLicencia = estadoLicencia;
  protected readonly tipos = new Map(TIPOS_EMPLEADO.map((t) => [t.id, t]));
  protected readonly contratos = aMapa(TIPOS_CONTRATO);
  protected readonly filasEsqueleto = [1, 2, 3, 4, 5];
  protected readonly columnasEsqueleto = [1, 2, 3, 4, 5, 6, 7, 8];
}
