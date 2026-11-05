import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Recorrido } from 'src/app/ruta-del-dia/recorrido';
import { Pagina, Paginacion } from 'src/app/shared/crud/crud';
import { FiltrosRecorrido } from './historial-recorridos';
import { HistorialRecorridosRepositorio } from './historial-recorridos-repositorio';

/**
 * `GET {apiUrl}/recorridos?texto=&desde=&hasta=&rutaId=&trayecto=&estado=&novedad=&pagina=&tamano=`
 * → `Pagina<Recorrido>` (solo ADMINISTRADOR; 403 para otros roles), ordenado del más reciente al más
 * antiguo. Los filtros vacíos se omiten. Mismas reglas que `HistorialRecorridosLocal`.
 */
@Injectable()
export class HistorialRecorridosHttp extends HistorialRecorridosRepositorio {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosRecorrido, paginacion: Paginacion): Observable<Pagina<Recorrido>> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries({ ...filtros, ...paginacion })) {
      if (valor !== '' && valor !== null && valor !== undefined) params = params.set(clave, String(valor));
    }
    return this.http.get<Pagina<Recorrido>>(`${environment.apiUrl}/recorridos`, { params });
  }
}
