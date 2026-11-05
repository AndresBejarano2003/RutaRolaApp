import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { FiltrosVehiculo, Vehiculo } from './vehiculo';
import { VehiculosRepositorio } from './vehiculos-repositorio';

/**
 * Conexión al API: `{apiUrl}/vehiculos` (filtros `texto`, `tipo`, `estado`).
 * Reglas del API: placa y número interno únicos (409); `DELETE` responde
 * 409 si el vehículo tiene asignaciones.
 */
@Injectable()
export class VehiculosHttp extends RepositorioHttp<Vehiculo, FiltrosVehiculo> implements VehiculosRepositorio {
  protected readonly recurso = 'vehiculos';
}
