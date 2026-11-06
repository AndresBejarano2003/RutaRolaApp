import { Injectable, inject } from '@angular/core';
import { Observable, defer, distinctUntilChanged, filter, fromEvent, interval, map, merge, startWith } from 'rxjs';
import { AuthService } from 'src/app/core/auth';
import { ErrorCrud } from 'src/app/shared/crud/crud';
import { FuenteLocal, LATENCIA_LOCAL, responderLocal } from 'src/app/shared/crud/repositorio-local';
import { Recorrido, contarParadas } from '../recorrido';
import { CLAVE_RECORRIDOS } from '../recorridos-local';
import { DIAS_RETENCION_GPS, LecturaGps, MAXIMO_POR_LOTE, PosicionGps, RecorridoEnMapa, ResultadoLoteGps } from './gps';
import { GpsRepositorio } from './gps-repositorio';

/** Clave de `localStorage`: `{ [recorridoId]: PosicionGps[] }` en orden de fecha. */
export const CLAVE_GPS = 'rutarola.gps';
/** Margen alrededor del inicio y fin del recorrido en el que se aceptan lecturas (igual que el API). */
const MARGEN_MS = 5 * 60_000;
/** Sin hub: cada cuánto se revisa si hay posiciones nuevas (además del evento `storage` de otra pestaña). */
const INTERVALO_LOCAL_MS = 5_000;

/**
 * Almacenamiento TEMPORAL en el navegador con las mismas reglas que `GpsHttp`: solo el personal del
 * recorrido envía; repetidas o fuera del periodo se descartan; el acudiente ve la última posición solo
 * EN CURSO; se borran las de más de `DIAS_RETENCION_GPS` días. Otra pestaña ve los cambios al instante.
 */
@Injectable()
export class GpsLocal extends GpsRepositorio implements FuenteLocal {
  readonly modoLocal = true as const;
  private readonly auth = inject(AuthService);
  private readonly latenciaMs = inject(LATENCIA_LOCAL);

  enviar(recorridoId: string, lecturas: LecturaGps[]): Observable<ResultadoLoteGps> {
    return responderLocal(() => {
      if (lecturas.length === 0 || lecturas.length > MAXIMO_POR_LOTE) {
        throw new ErrorCrud(`Envía entre 1 y ${MAXIMO_POR_LOTE} posiciones.`, 'VALIDACION');
      }
      const empleadoId = this.auth.sesion()?.empleadoId ?? '';
      const r = this.recorridos().find((x) => x.id === recorridoId && (x.conductorId === empleadoId || x.monitoraId === empleadoId));
      if (!r) throw new ErrorCrud('El recorrido no existe o no pertenece a tus rutas.', 'NO_ENCONTRADO');

      const todas = this.leer();
      const guardadas = todas[recorridoId] ?? [];
      const fechas = new Set(guardadas.map((p) => new Date(p.fecha).getTime()));
      const desde = new Date(r.inicio).getTime() - MARGEN_MS;
      const hasta = (r.fin ? new Date(r.fin).getTime() : Date.now()) + MARGEN_MS;
      const validas: PosicionGps[] = [];
      for (const l of lecturas) {
        const t = new Date(l.fecha).getTime();
        if (!Number.isFinite(t) || t < desde || t > hasta || fechas.has(t)) continue;
        fechas.add(t);
        validas.push({ ...l, recorridoId, vehiculoId: r.asignacionId, vehiculo: r.vehiculo });
      }
      const nuevas = [...guardadas, ...validas].sort((a, b) => a.fecha.localeCompare(b.fecha));
      this.escribir({ ...todas, [recorridoId]: nuevas });
      return { recibidas: validas.length, descartadas: lecturas.length - validas.length, ultima: nuevas.at(-1) ?? null };
    }, this.latenciaMs);
  }

  ultima(recorridoId: string): Observable<PosicionGps | null> {
    return defer(() => responderLocal(() => this.ultimaVisible(recorridoId), this.latenciaMs));
  }

  trayecto(recorridoId: string): Observable<PosicionGps[]> {
    return defer(() =>
      responderLocal(() => {
        if (this.auth.sesion()?.rol === 'ACUDIENTE') throw new ErrorCrud('No tienes permiso para realizar esta acción.', 'VALIDACION');
        return this.leer()[recorridoId] ?? [];
      }, this.latenciaMs),
    );
  }

  enCurso(): Observable<RecorridoEnMapa[]> {
    return defer(() =>
      responderLocal(() => {
        const gps = this.leer();
        return this.recorridos()
          .filter((r) => r.estado === 'EN_CURSO')
          .map((r) => ({
            recorridoId: r.id,
            ruta: r.ruta,
            trayecto: r.trayecto,
            conductor: r.conductor,
            vehiculo: r.vehiculo,
            conteo: contarParadas(r.paradas),
            posicion: gps[r.id]?.at(-1) ?? null,
          }))
          .sort((a, b) => a.ruta.localeCompare(b.ruta));
      }, this.latenciaMs),
    );
  }

  observar(recorridoId: string): Observable<PosicionGps> {
    return this.cambios().pipe(
      map(() => this.ultimaVisible(recorridoId)),
      filter((p): p is PosicionGps => p !== null),
      distinctUntilChanged((a, b) => a.fecha === b.fecha),
    );
  }

  observarEmpresa(): Observable<PosicionGps | null> {
    // Sin hub: avisa que vuelva a pedir la lista cuando cambian las posiciones o los recorridos.
    return this.cambios().pipe(
      map(() => `${localStorage.getItem(CLAVE_GPS) ?? ''}|${localStorage.getItem(CLAVE_RECORRIDOS) ?? ''}`),
      distinctUntilChanged(),
      map(() => null),
    );
  }

  private ultimaVisible(recorridoId: string): PosicionGps | null {
    if (this.auth.sesion()?.rol === 'ACUDIENTE') {
      const r = this.recorridos().find((x) => x.id === recorridoId);
      if (r?.estado !== 'EN_CURSO') return null;
    }
    return this.leer()[recorridoId]?.at(-1) ?? null;
  }

  private cambios(): Observable<unknown> {
    const otraPestana = fromEvent<StorageEvent>(window, 'storage').pipe(filter((e) => e.key === CLAVE_GPS || e.key === CLAVE_RECORRIDOS));
    return merge(otraPestana, interval(INTERVALO_LOCAL_MS)).pipe(startWith(null));
  }

  private recorridos(): Recorrido[] {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_RECORRIDOS) ?? '[]') as Recorrido[];
    } catch {
      return [];
    }
  }

  private leer(): Record<string, PosicionGps[]> {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_GPS) ?? '{}') as Record<string, PosicionGps[]>;
    } catch {
      return {};
    }
  }

  /** Guarda aplicando la retención (como el proceso del servidor). */
  private escribir(todas: Record<string, PosicionGps[]>): void {
    const limite = new Date(Date.now() - DIAS_RETENCION_GPS * 86_400_000).toISOString();
    const vigentes = Object.fromEntries(
      Object.entries(todas)
        .map(([id, lista]) => [id, lista.filter((p) => p.fecha >= limite)] as const)
        .filter(([, lista]) => lista.length > 0),
    );
    try {
      localStorage.setItem(CLAVE_GPS, JSON.stringify(vigentes));
    } catch {
      throw new ErrorCrud('No hay espacio en el almacenamiento temporal del navegador.', 'SIN_ESPACIO');
    }
  }
}
