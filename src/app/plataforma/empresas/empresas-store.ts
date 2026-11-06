import { Injectable, inject } from '@angular/core';
import { Empresa } from 'src/app/inicio/configuracion/configuracion';
import { ListadoStore } from 'src/app/shared/crud/listado-store';
import { FILTROS_EMPRESA_VACIOS, FiltrosEmpresa } from './empresa';
import { EmpresasRepositorio } from './empresas-repositorio';

@Injectable()
export class EmpresasStore extends ListadoStore<Empresa, FiltrosEmpresa> {
  protected readonly repositorio = inject(EmpresasRepositorio);

  constructor() {
    super(FILTROS_EMPRESA_VACIOS);
  }
}
