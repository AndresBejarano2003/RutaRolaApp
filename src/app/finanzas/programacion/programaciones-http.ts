import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { EnvioProgramado, FiltrosProgramacion, Programacion } from './programacion';
import { ProgramacionesRepositorio } from './programaciones-repositorio';

/**
 * Conexión al API: `{apiUrl}/programaciones` (filtros `texto`, `facturaId`,
 * `estado`) más:
 * - `GET /programaciones/{id}/envios` → `EnvioProgramado[]`
 * - `GET /programaciones/envios/conteo?ids=a,b` → `{ [id]: número }`
 *
 * El API valida: una programación por factura (409) y exactamente un
 * mensaje "En uso" por canal activo (422). El envío lo hace un proceso
 * programado del servidor: `diasPrevios` días antes de `diaLimitePago`.
 */
@Injectable()
export class ProgramacionesHttp
  extends RepositorioHttp<Programacion, FiltrosProgramacion>
  implements ProgramacionesRepositorio
{
  protected readonly recurso = 'programaciones';

  historial(programacionId: string): Observable<EnvioProgramado[]> {
    return this.http.get<EnvioProgramado[]>(`${this.url}/${encodeURIComponent(programacionId)}/envios`);
  }

  conteoEnvios(ids: string[]): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.url}/envios/conteo`, { params: { ids: ids.join(',') } });
  }
}
