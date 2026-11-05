import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { FILTROS_VEHICULO_VACIOS, FiltrosVehiculo, Vehiculo } from './vehiculo';
import { VehiculosRepositorio } from './vehiculos-repositorio';

@Injectable()
export class VehiculosStore extends CrudStore<Vehiculo, FiltrosVehiculo> {
  protected readonly repositorio = inject(VehiculosRepositorio);
  protected readonly textos = {
    creado: 'Vehículo registrado correctamente.',
    actualizado: 'Vehículo actualizado correctamente.',
    eliminado: 'Vehículo eliminado.',
  };

  constructor() {
    super(FILTROS_VEHICULO_VACIOS);
  }
}
