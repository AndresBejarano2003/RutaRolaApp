import { Injectable, inject } from '@angular/core';
import { Recorrido } from 'src/app/ruta-del-dia/recorrido';
import { ListadoStore } from 'src/app/shared/crud/listado-store';
import { FILTROS_RECORRIDO_VACIOS, FiltrosRecorrido } from './historial-recorridos';
import { HistorialRecorridosRepositorio } from './historial-recorridos-repositorio';

@Injectable()
export class HistorialRecorridosStore extends ListadoStore<Recorrido, FiltrosRecorrido> {
  protected readonly repositorio = inject(HistorialRecorridosRepositorio);

  constructor() {
    super(FILTROS_RECORRIDO_VACIOS);
  }
}
