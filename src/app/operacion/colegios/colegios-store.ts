import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { Colegio, FILTROS_COLEGIO_VACIOS, FiltrosColegio } from './colegio';
import { ColegiosRepositorio } from './colegios-repositorio';

@Injectable()
export class ColegiosStore extends CrudStore<Colegio, FiltrosColegio> {
  protected readonly repositorio = inject(ColegiosRepositorio);
  protected readonly textos = {
    creado: 'Colegio registrado correctamente.',
    actualizado: 'Colegio actualizado correctamente.',
    eliminado: 'Colegio eliminado.',
  };

  constructor() {
    super(FILTROS_COLEGIO_VACIOS);
  }
}
