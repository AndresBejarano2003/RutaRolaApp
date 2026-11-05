import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CuotaPendiente, FiltrosIngresos, FiltrosMorosos, FiltrosPendientes, Moroso, ReporteIngresos } from './reportes';
import { ReportesRepositorio } from './reportes-repositorio';

@Injectable()
export class ReportesHttp extends ReportesRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  ingresos(filtros: FiltrosIngresos): Observable<ReporteIngresos> {
    return this.http.get<ReporteIngresos>(`${this.url}/ingresos`, { params: parametros(filtros) });
  }

  pendientes(filtros: FiltrosPendientes): Observable<CuotaPendiente[]> {
    return this.http.get<CuotaPendiente[]>(`${this.url}/facturas-pendientes`, { params: parametros(filtros) });
  }

  morosos(filtros: FiltrosMorosos): Observable<Moroso[]> {
    return this.http.get<Moroso[]>(`${this.url}/morosos`, { params: parametros(filtros) });
  }
}

function parametros(filtros: object): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== '' && valor !== null && valor !== undefined) params = params.set(clave, String(valor));
  }
  return params;
}
