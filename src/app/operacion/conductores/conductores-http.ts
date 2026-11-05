import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Pagina, Paginacion } from 'src/app/shared/crud/crud';
import { ConductorOperacion, FiltrosConductor } from './conductor';
import { ConductoresRepositorio } from './conductores-repositorio';

/**
 * `GET {apiUrl}/conductores?texto=&licencia=&asignacion=&estado=&pagina=&tamano=`
 * → `Pagina<ConductorOperacion>` (empleados CONDUCTOR + asignación activa).
 */
@Injectable()
export class ConductoresHttp extends ConductoresRepositorio {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosConductor, paginacion: Paginacion): Observable<Pagina<ConductorOperacion>> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries({ ...filtros, ...paginacion })) {
      if (valor !== '') params = params.set(clave, String(valor));
    }
    return this.http.get<Pagina<ConductorOperacion>>(`${environment.apiUrl}/conductores`, { params });
  }
}
