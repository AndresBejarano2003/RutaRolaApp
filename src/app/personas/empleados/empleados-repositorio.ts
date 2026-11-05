import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { Empleado, FiltrosEmpleado } from './empleado';

/**
 * Token de acceso a datos de empleados. La implementación se elige en
 * `personas.routes.ts`: `EmpleadosLocal` (temporal) o `EmpleadosHttp` (API).
 */
export abstract class EmpleadosRepositorio extends RepositorioCrud<Empleado, FiltrosEmpleado> {}
