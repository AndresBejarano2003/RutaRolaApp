import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { Acudiente, FiltrosAcudiente } from './acudiente';

/**
 * Token de acceso a datos de acudientes. La implementación se elige en
 * `personas.routes.ts`: `AcudientesLocal` (temporal) o `AcudientesHttp` (API).
 */
export abstract class AcudientesRepositorio extends RepositorioCrud<Acudiente, FiltrosAcudiente> {}
