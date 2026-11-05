import { Observable, of } from 'rxjs';
import { OpcionCatalogo } from '../catalogos/catalogos';
import { DatosRegistro, Entidad, Pagina, Paginacion } from './crud';

/** Contrato mínimo de una fuente de datos paginada (listados de solo lectura y reportes). */
export abstract class RepositorioLectura<T, F> {
  abstract listar(filtros: F, paginacion: Paginacion): Observable<Pagina<T>>;
}

/**
 * Contrato de acceso a datos de un CRUD. Las pantallas y stores dependen
 * SOLO de este contrato; la implementación (local o HTTP) se elige en
 * `core/repositorios.ts` con `{ provide: XRepositorio, useClass: ... }`.
 */
export abstract class RepositorioCrud<T extends Entidad, F> extends RepositorioLectura<T, F> {
  abstract obtener(id: string): Observable<T>;
  abstract crear(datos: DatosRegistro<T>): Observable<T>;
  abstract actualizar(id: string, datos: DatosRegistro<T>): Observable<T>;
  abstract eliminar(id: string): Observable<void>;

  /**
   * Lista liviana `{ id, nombre }` para `<app-selector-busqueda>` en otras
   * pantallas. Acepta los mismos filtros del listado (p. ej. solo conductores
   * activos: `{ tipoEmpleado: 'CONDUCTOR', estado: 'ACTIVO' }`).
   */
  abstract opciones(filtros?: Partial<F>): Observable<OpcionCatalogo[]>;

  /**
   * Integridad referencial: motivo por el que el registro NO se puede
   * eliminar (otros registros lo usan), o `null` si se puede. La pantalla lo
   * consulta antes de pedir confirmación. Con API, el `DELETE` debe además
   * responder 409 con `{ "mensaje": "..." }`.
   */
  motivoNoEliminar(_id: string): Observable<string | null> {
    return of(null);
  }
}
