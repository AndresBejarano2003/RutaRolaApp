import { Injectable, inject } from '@angular/core';
import { ListadoStore } from 'src/app/shared/crud/listado-store';
import { ConductorOperacion, FILTROS_CONDUCTOR_VACIOS, FiltrosConductor } from './conductor';
import { ConductoresRepositorio } from './conductores-repositorio';

@Injectable()
export class ConductoresStore extends ListadoStore<ConductorOperacion, FiltrosConductor> {
  protected readonly repositorio = inject(ConductoresRepositorio);

  constructor() {
    super(FILTROS_CONDUCTOR_VACIOS);
  }
}
