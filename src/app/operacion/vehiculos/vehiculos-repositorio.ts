import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { FiltrosVehiculo, Vehiculo } from './vehiculo';

/** Token de acceso a datos de vehículos (implementación en `core/repositorios.ts`). */
export abstract class VehiculosRepositorio extends RepositorioCrud<Vehiculo, FiltrosVehiculo> {}
