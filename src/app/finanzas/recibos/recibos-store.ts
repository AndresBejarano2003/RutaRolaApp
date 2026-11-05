import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { FILTROS_RECIBO_VACIOS, FiltrosRecibo, Recibo } from './recibo';
import { RecibosRepositorio } from './recibos-repositorio';

@Injectable()
export class RecibosStore extends CrudStore<Recibo, FiltrosRecibo> {
  protected readonly repositorio = inject(RecibosRepositorio);
  protected readonly textos = {
    creado: 'Pago registrado correctamente.',
    actualizado: 'Recibo actualizado correctamente.',
    eliminado: 'Recibo eliminado.',
  };

  constructor() {
    super(FILTROS_RECIBO_VACIOS);
  }
}
