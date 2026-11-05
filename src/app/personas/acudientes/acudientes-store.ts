import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { Acudiente, FILTROS_ACUDIENTE_VACIOS, FiltrosAcudiente } from './acudiente';
import { AcudientesRepositorio } from './acudientes-repositorio';

@Injectable()
export class AcudientesStore extends CrudStore<Acudiente, FiltrosAcudiente> {
  protected readonly repositorio = inject(AcudientesRepositorio);
  protected readonly textos = {
    creado: 'Acudiente registrado correctamente.',
    actualizado: 'Acudiente actualizado correctamente.',
    eliminado: 'Acudiente eliminado.',
  };

  constructor() {
    super(FILTROS_ACUDIENTE_VACIOS);
  }
}
