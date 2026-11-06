import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Empresa } from 'src/app/inicio/configuracion/configuracion';
import { desdeApi } from 'src/app/inicio/configuracion/configuracion-http';
import { Pagina, Paginacion } from 'src/app/shared/crud/crud';
import { FiltrosEmpresa, SolicitudEmpresa } from './empresa';
import { EmpresasRepositorio } from './empresas-repositorio';

/**
 * `empresas.gestionar` (SUPER_ADMIN):
 * - `GET /empresas?texto=&estado=&pagina=&tamano=` → `Pagina<Empresa>` (por nombre);
 * - `POST /empresas` → 201 con la configuración por defecto y, si viene `administrador`, su primer
 *   usuario ADMINISTRADOR (409 NIT repetido o usuario/correo ya en uso);
 * - `PUT /empresas/{id}` (sin `administrador`). No hay DELETE: se inactiva.
 */
@Injectable()
export class EmpresasHttp extends EmpresasRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/empresas`;

  listar(filtros: FiltrosEmpresa, paginacion: Paginacion): Observable<Pagina<Empresa>> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries({ ...filtros, ...paginacion })) {
      if (valor !== '') params = params.set(clave, String(valor));
    }
    return this.http.get<Pagina<Parameters<typeof desdeApi>[0]>>(this.url, { params }).pipe(map((p) => ({ ...p, items: p.items.map(desdeApi) })));
  }

  crear(solicitud: SolicitudEmpresa): Observable<Empresa> {
    return this.http.post<Parameters<typeof desdeApi>[0]>(this.url, solicitud).pipe(map(desdeApi));
  }

  actualizar(id: string, solicitud: SolicitudEmpresa): Observable<Empresa> {
    const { administrador: _, ...datos } = solicitud;
    return this.http.put<Parameters<typeof desdeApi>[0]>(`${this.url}/${encodeURIComponent(id)}`, datos).pipe(map(desdeApi));
  }
}
