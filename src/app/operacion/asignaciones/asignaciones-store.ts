import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { Asignacion, FILTROS_ASIGNACION_VACIOS, FiltrosAsignacion } from './asignacion';
import { AsignacionesRepositorio } from './asignaciones-repositorio';

@Injectable()
export class AsignacionesStore extends CrudStore<Asignacion, FiltrosAsignacion> {
  protected readonly repositorio = inject(AsignacionesRepositorio);
  protected readonly textos = {
    creado: 'Asignación registrada correctamente.',
    actualizado: 'Asignación actualizada correctamente.',
    eliminado: 'Asignación eliminada.',
  };

  constructor() {
    super(FILTROS_ASIGNACION_VACIOS);
  }
}
