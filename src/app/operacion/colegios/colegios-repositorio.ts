import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { Colegio, FiltrosColegio } from './colegio';

/** Token de acceso a datos de colegios (implementación en `core/repositorios.ts`). */
export abstract class ColegiosRepositorio extends RepositorioCrud<Colegio, FiltrosColegio> {}
