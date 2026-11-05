import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { FILTROS_FACTURA_VACIOS, Factura, FiltrosFactura } from './factura';
import { FacturasRepositorio } from './facturas-repositorio';

@Injectable()
export class FacturasStore extends CrudStore<Factura, FiltrosFactura> {
  protected readonly repositorio = inject(FacturasRepositorio);
  protected readonly textos = {
    creado: 'Factura registrada correctamente.',
    actualizado: 'Factura actualizada correctamente.',
    eliminado: 'Factura eliminada.',
  };

  constructor() {
    super(FILTROS_FACTURA_VACIOS);
  }
}
