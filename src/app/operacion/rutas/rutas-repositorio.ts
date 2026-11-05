import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { FiltrosRuta, Ruta } from './ruta';

/** Token de acceso a datos de rutas (implementación en `core/repositorios.ts`). */
export abstract class RutasRepositorio extends RepositorioCrud<Ruta, FiltrosRuta> {}
