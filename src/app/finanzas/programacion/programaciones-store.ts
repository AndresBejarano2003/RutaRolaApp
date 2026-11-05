import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { FILTROS_PROGRAMACION_VACIOS, FiltrosProgramacion, Programacion } from './programacion';
import { ProgramacionesRepositorio } from './programaciones-repositorio';

@Injectable()
export class ProgramacionesStore extends CrudStore<Programacion, FiltrosProgramacion> {
  protected readonly repositorio = inject(ProgramacionesRepositorio);
  protected readonly textos = {
    creado: 'Programación registrada correctamente.',
    actualizado: 'Programación actualizada correctamente.',
    eliminado: 'Programación eliminada.',
  };

  constructor() {
    super(FILTROS_PROGRAMACION_VACIOS);
  }
}
