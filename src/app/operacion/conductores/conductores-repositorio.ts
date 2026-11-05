import { RepositorioLectura } from 'src/app/shared/crud/repositorio-crud';
import { ConductorOperacion, FiltrosConductor } from './conductor';

/** Fuente de solo lectura (implementación en `core/repositorios.ts`). */
export abstract class ConductoresRepositorio extends RepositorioLectura<ConductorOperacion, FiltrosConductor> {}
