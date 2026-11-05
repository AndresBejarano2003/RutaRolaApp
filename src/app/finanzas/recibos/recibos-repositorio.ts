import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { FiltrosRecibo, Recibo } from './recibo';

/** Token de acceso a datos de recibos (implementación en `core/repositorios.ts`). */
export abstract class RecibosRepositorio extends RepositorioCrud<Recibo, FiltrosRecibo> {}
