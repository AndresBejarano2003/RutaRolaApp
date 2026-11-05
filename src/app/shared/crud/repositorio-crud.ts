import { Observable } from 'rxjs';
import { DatosRegistro, Entidad, Pagina, Paginacion } from './crud';

/**
 * Contrato de acceso a datos de un CRUD. Las pantallas y stores dependen
 * SOLO de este contrato; la implementación (local o HTTP) se elige en las
 * rutas del módulo con `{ provide: XRepositorio, useClass: ... }`.
 */
export abstract class RepositorioCrud<T extends Entidad, F> {
  abstract listar(filtros: F, paginacion: Paginacion): Observable<Pagina<T>>;
  abstract obtener(id: string): Observable<T>;
  abstract crear(datos: DatosRegistro<T>): Observable<T>;
  abstract actualizar(id: string, datos: DatosRegistro<T>): Observable<T>;
  abstract eliminar(id: string): Observable<void>;
}
