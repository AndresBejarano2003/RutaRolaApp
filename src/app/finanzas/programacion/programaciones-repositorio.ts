import { Observable } from 'rxjs';
import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { EnvioProgramado, FiltrosProgramacion, Programacion } from './programacion';

/** Token de acceso a datos de programaciones (implementación en `core/repositorios.ts`). */
export abstract class ProgramacionesRepositorio extends RepositorioCrud<Programacion, FiltrosProgramacion> {
  /** Historial de envíos de una programación (más reciente primero). */
  abstract historial(programacionId: string): Observable<EnvioProgramado[]>;
  /** Cantidad de envíos por programación, para la columna del listado. */
  abstract conteoEnvios(ids: string[]): Observable<Record<string, number>>;
}
