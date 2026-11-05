import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { Cotizacion, FILTROS_COTIZACION_VACIOS, FiltrosCotizacion } from './cotizacion';
import { CotizacionesRepositorio } from './cotizaciones-repositorio';

@Injectable()
export class CotizacionesStore extends CrudStore<Cotizacion, FiltrosCotizacion> {
  protected readonly repositorio = inject(CotizacionesRepositorio);
  protected readonly textos = {
    creado: 'Cotización registrada correctamente.',
    actualizado: 'Cotización actualizada correctamente.',
    eliminado: 'Cotización eliminada.',
  };

  constructor() {
    super(FILTROS_COTIZACION_VACIOS);
  }
}
