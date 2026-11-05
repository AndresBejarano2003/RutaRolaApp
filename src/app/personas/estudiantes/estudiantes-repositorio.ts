import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { Estudiante, FiltrosEstudiante } from './estudiante';

/**
 * Token de acceso a datos de estudiantes. La implementación se elige en
 * `personas.routes.ts`: `EstudiantesLocal` (temporal) o `EstudiantesHttp` (API).
 */
export abstract class EstudiantesRepositorio extends RepositorioCrud<Estudiante, FiltrosEstudiante> {}
