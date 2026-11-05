import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Recorrido } from 'src/app/ruta-del-dia/recorrido';
import { CLAVE_RECORRIDOS } from 'src/app/ruta-del-dia/recorridos-local';
import { Pagina, Paginacion } from 'src/app/shared/crud/crud';
import { FuenteLocal, LATENCIA_LOCAL, responderLocal } from 'src/app/shared/crud/repositorio-local';
import { normalizar } from 'src/app/shared/formularios/formularios';
import { FiltrosRecorrido, tieneNovedad } from './historial-recorridos';
import { HistorialRecorridosRepositorio } from './historial-recorridos-repositorio';

/** Lee los recorridos guardados por `RecorridosLocal` (TEMPORAL, mientras no existe el API). */
@Injectable()
export class HistorialRecorridosLocal extends HistorialRecorridosRepositorio implements FuenteLocal {
  readonly modoLocal = true as const;
  private readonly latenciaMs = inject(LATENCIA_LOCAL);

  listar(f: FiltrosRecorrido, { pagina, tamano }: Paginacion): Observable<Pagina<Recorrido>> {
    return responderLocal(() => {
      const texto = normalizar(f.texto);
      const filtrados = this.leer()
        .filter(
          (r) =>
            (!texto ||
              normalizar(
                [r.ruta, r.colegio, r.vehiculo, r.conductor, r.monitora, ...r.paradas.map((p) => p.estudiante)].join(' '),
              ).includes(texto)) &&
            (!f.desde || r.fecha >= f.desde) &&
            (!f.hasta || r.fecha <= f.hasta) &&
            (!f.rutaId || r.rutaId === f.rutaId) &&
            (!f.trayecto || r.trayecto === f.trayecto) &&
            (!f.estado || r.estado === f.estado) &&
            tieneNovedad(r, f.novedad),
        )
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.inicio.localeCompare(a.inicio));
      const inicio = (pagina - 1) * tamano;
      return { items: filtrados.slice(inicio, inicio + tamano), total: filtrados.length, pagina, tamano };
    }, this.latenciaMs);
  }

  private leer(): Recorrido[] {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_RECORRIDOS) ?? '[]') as Recorrido[];
    } catch {
      return [];
    }
  }
}
