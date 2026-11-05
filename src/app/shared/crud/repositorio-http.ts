import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { DatosRegistro, Entidad, Pagina, Paginacion } from './crud';
import { OpcionCatalogo } from '../catalogos/catalogos';
import { RepositorioCrud } from './repositorio-crud';

/**
 * Implementación REST lista para usar cuando exista el API:
 *
 * | Operación  | Petición                                        |
 * |------------|-------------------------------------------------|
 * | listar     | GET    {apiUrl}/{recurso}?pagina=&tamano=&...   |
 * | obtener    | GET    {apiUrl}/{recurso}/{id}                  |
 * | crear      | POST   {apiUrl}/{recurso}                       |
 * | actualizar | PUT    {apiUrl}/{recurso}/{id}                  |
 * | eliminar   | DELETE {apiUrl}/{recurso}/{id}                  |
 * | opciones   | GET    {apiUrl}/{recurso}/opciones?<filtros> → [{id, nombre}] |
 *
 * `listar` espera una respuesta `Pagina<T>`. Si el API responde con otro
 * formato, sobrescribir `listar` en la subclase y adaptar la respuesta.
 */
export abstract class RepositorioHttp<T extends Entidad, F extends object> extends RepositorioCrud<T, F> {
  protected readonly http = inject(HttpClient);

  /** Segmento del recurso, p. ej. `'estudiantes'`. */
  protected abstract readonly recurso: string;

  protected get url(): string {
    return `${environment.apiUrl}/${this.recurso}`;
  }

  listar(filtros: F, paginacion: Paginacion): Observable<Pagina<T>> {
    return this.http.get<Pagina<T>>(this.url, { params: this.aParametros({ ...filtros, ...paginacion }) });
  }

  obtener(id: string): Observable<T> {
    return this.http.get<T>(`${this.url}/${encodeURIComponent(id)}`);
  }

  crear(datos: DatosRegistro<T>): Observable<T> {
    return this.http.post<T>(this.url, datos);
  }

  actualizar(id: string, datos: DatosRegistro<T>): Observable<T> {
    return this.http.put<T>(`${this.url}/${encodeURIComponent(id)}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`);
  }

  opciones(filtros: Partial<F> = {}): Observable<OpcionCatalogo[]> {
    return this.http.get<OpcionCatalogo[]>(`${this.url}/opciones`, { params: this.aParametros(filtros) });
  }

  /** Convierte filtros a query params, omitiendo los vacíos. */
  protected aParametros(valores: object): HttpParams {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(valores)) {
      if (valor !== '' && valor !== null && valor !== undefined) {
        params = params.set(clave, String(valor));
      }
    }
    return params;
  }
}
