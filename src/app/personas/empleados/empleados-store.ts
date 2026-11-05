import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { Empleado, FILTROS_EMPLEADO_VACIOS, FiltrosEmpleado } from './empleado';
import { EmpleadosRepositorio } from './empleados-repositorio';

@Injectable()
export class EmpleadosStore extends CrudStore<Empleado, FiltrosEmpleado> {
  protected readonly repositorio = inject(EmpleadosRepositorio);
  protected readonly textos = {
    creado: 'Empleado registrado correctamente.',
    actualizado: 'Empleado actualizado correctamente.',
    eliminado: 'Empleado eliminado.',
  };

  constructor() {
    super(FILTROS_EMPLEADO_VACIOS);
  }
}
