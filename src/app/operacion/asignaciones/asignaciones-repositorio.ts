import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { Asignacion, FiltrosAsignacion } from './asignacion';

/** Token de acceso a datos de asignaciones (implementación en `core/repositorios.ts`). */
export abstract class AsignacionesRepositorio extends RepositorioCrud<Asignacion, FiltrosAsignacion> {}
