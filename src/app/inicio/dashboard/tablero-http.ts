import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Tablero } from './tablero';
import { TableroRepositorio } from './tablero-repositorio';

/**
 * `GET {apiUrl}/tablero` → `Tablero`, calculado por el servidor con las mismas reglas de
 * `calcular-tablero.ts` (mes en curso, cartera, pendientes, agenda de 30 días, histórico de 12 meses).
 */
@Injectable()
export class TableroHttp extends TableroRepositorio {
  private readonly http = inject(HttpClient);

  obtener(): Observable<Tablero> {
    return this.http.get<Tablero>(`${environment.apiUrl}/tablero`);
  }
}
