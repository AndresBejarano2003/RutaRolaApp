import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { FILTROS_RUTA_VACIOS, FiltrosRuta, Ruta } from './ruta';
import { RutasRepositorio } from './rutas-repositorio';

@Injectable()
export class RutasStore extends CrudStore<Ruta, FiltrosRuta> {
  protected readonly repositorio = inject(RutasRepositorio);
  protected readonly textos = {
    creado: 'Ruta registrada correctamente.',
    actualizado: 'Ruta actualizada correctamente.',
    eliminado: 'Ruta eliminada.',
  };

  constructor() {
    super(FILTROS_RUTA_VACIOS);
  }
}
