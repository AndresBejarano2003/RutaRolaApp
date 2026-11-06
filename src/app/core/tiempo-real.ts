import { Injectable, inject } from '@angular/core';
import type { HubConnection } from '@microsoft/signalr';
import { Observable, Subject, filter, firstValueFrom, map, merge } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from './auth';
import { RenovacionSesion } from './interceptor-autenticacion';

/** Posición GPS que emite el hub (`PosicionDto` del API). */
export interface PosicionTiempoReal {
  recorridoId: string;
  vehiculoId: string;
  vehiculo: string;
  latitud: number;
  longitud: number;
  velocidad: number | null;
  rumbo: number | null;
  /** ISO UTC */
  fecha: string;
}

/** El recorrido cambió (inicio, paradas, orden o fin): quien lo muestra lo vuelve a consultar. */
export interface AvisoRecorrido {
  recorridoId: string;
  fechaActualizacion: string | null;
  estado: string;
}

/** URL del hub a partir de `environment.apiUrl` (`https://host/api/v1` → `https://host/hubs/recorridos`). */
export function urlHub(apiUrl = environment.apiUrl): string {
  return `${apiUrl.replace(/\/api\/v\d+\/?$/, '')}/hubs/recorridos`;
}

/** Renueva el access token si le queda menos de esto al conectar o reconectar. */
const MARGEN_RENOVACION_MS = 60_000;
/** Si la reconexión automática se rinde, se vuelve a intentar cada tanto mientras alguien escuche. */
const REINTENTO_CONEXION_MS = 30_000;

/**
 * Conexión ÚNICA y perezosa al hub SignalR `/hubs/recorridos` del API (solo la usan las implementaciones
 * `*Http`; en modo local no se abre). Se conecta con el primer suscriptor y se cierra con el último.
 * - `seguir(id)` / `seguirEmpresa()` se recuerdan y se vuelven a pedir tras cada reconexión.
 * - El servidor envía `recorridoActualizado` también SIN seguir: al personal del recorrido (rutas del
 *   día) y a los acudientes de sus estudiantes (portal).
 * - Tras reconectar emite `reconectado` para que cada pantalla consulte lo que se perdió.
 * El paquete `@microsoft/signalr` se carga solo al conectar (fuera del bundle inicial).
 */
@Injectable({ providedIn: 'root' })
export class TiempoReal {
  private readonly auth = inject(AuthService);
  private readonly renovacion = inject(RenovacionSesion);

  private conexion: HubConnection | null = null;
  private conectando: Promise<HubConnection | null> | null = null;
  private usos = 0;
  private reintento: ReturnType<typeof setTimeout> | null = null;
  /** Recorridos seguidos (con cuántos suscriptores) y si se sigue la empresa. */
  private readonly seguidos = new Map<string, number>();
  private empresa = 0;

  private readonly posiciones$ = new Subject<PosicionTiempoReal>();
  private readonly avisos$ = new Subject<AvisoRecorrido>();
  private readonly reconectado$ = new Subject<void>();

  /** Avisos `recorridoActualizado` que le llegan a este usuario (y una señal tras cada reconexión). */
  avisos(): Observable<AvisoRecorrido | null> {
    return this.usar(merge(this.avisos$, this.reconectado$.pipe(map(() => null))));
  }

  /** Cambios de UN recorrido (lo sigue mientras haya suscripción); `null` = se reconectó. */
  cambiosDe(recorridoId: string): Observable<AvisoRecorrido | null> {
    return this.siguiendo(
      recorridoId,
      merge(this.avisos$.pipe(filter((a) => a.recorridoId === recorridoId)), this.reconectado$.pipe(map(() => null))),
    );
  }

  /** Posiciones de UN recorrido mientras esté en curso. */
  posicionesDe(recorridoId: string): Observable<PosicionTiempoReal> {
    return this.siguiendo(recorridoId, this.posiciones$.pipe(filter((p) => p.recorridoId === recorridoId)));
  }

  /** Posiciones y cambios de TODOS los recorridos de la empresa (mapa del administrador). */
  empresaCompleta(): Observable<{ posicion: PosicionTiempoReal } | { aviso: AvisoRecorrido | null }> {
    return new Observable((sub) => {
      this.empresa++;
      if (this.conexion?.state === 'Connected' && this.empresa === 1) void this.invocar('SeguirEmpresa');
      const s = this.usar(
        merge(
          this.posiciones$.pipe(map((posicion) => ({ posicion }))),
          this.avisos$.pipe(map((aviso) => ({ aviso }))),
          this.reconectado$.pipe(map(() => ({ aviso: null }))),
        ),
      ).subscribe(sub);
      return () => {
        this.empresa--;
        s.unsubscribe();
      };
    });
  }

  private siguiendo<T>(recorridoId: string, fuente: Observable<T>): Observable<T> {
    return new Observable<T>((sub) => {
      const n = (this.seguidos.get(recorridoId) ?? 0) + 1;
      this.seguidos.set(recorridoId, n);
      if (n === 1 && this.conexion?.state === 'Connected') void this.invocar('Seguir', recorridoId);
      const s = this.usar(fuente).subscribe(sub);
      return () => {
        s.unsubscribe();
        const resto = (this.seguidos.get(recorridoId) ?? 1) - 1;
        if (resto > 0) {
          this.seguidos.set(recorridoId, resto);
        } else {
          this.seguidos.delete(recorridoId);
          if (this.conexion?.state === 'Connected') void this.invocar('Dejar', recorridoId);
        }
      };
    });
  }

  /** Mantiene la conexión abierta mientras haya suscripción a `fuente`. */
  private usar<T>(fuente: Observable<T>): Observable<T> {
    return new Observable<T>((sub) => {
      const s = fuente.subscribe(sub);
      this.usos++;
      void this.conectar();
      return () => {
        s.unsubscribe();
        this.usos--;
        if (this.usos === 0) void this.desconectar();
      };
    });
  }

  private conectar(): Promise<HubConnection | null> {
    if (this.conexion) return Promise.resolve(this.conexion);
    if (!this.auth.tokens()) return Promise.resolve(null);
    this.conectando ??= this.crear().finally(() => (this.conectando = null));
    return this.conectando;
  }

  private async crear(): Promise<HubConnection | null> {
    const signalr = await import('@microsoft/signalr');
    const conexion = new signalr.HubConnectionBuilder()
      .withUrl(urlHub(), { accessTokenFactory: () => this.token() })
      .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 20_000, 30_000])
      .configureLogging(signalr.LogLevel.None)
      .build();
    conexion.on('posicion', (p: PosicionTiempoReal) => this.posiciones$.next(p));
    conexion.on('recorridoActualizado', (a: AvisoRecorrido) => this.avisos$.next(a));
    conexion.onreconnected(() => {
      void this.volverASeguir();
      this.reconectado$.next();
    });
    conexion.onclose(() => {
      if (this.conexion === conexion) this.conexion = null;
      this.programarReintento();
    });
    try {
      await conexion.start();
    } catch {
      this.programarReintento();
      return null;
    }
    if (this.usos === 0) {
      await conexion.stop();
      return null;
    }
    this.conexion = conexion;
    await this.volverASeguir();
    return conexion;
  }

  private programarReintento(): void {
    if (this.usos === 0 || this.reintento) return;
    this.reintento = setTimeout(() => {
      this.reintento = null;
      if (this.usos > 0) {
        void this.conectar().then((c) => c && this.reconectado$.next());
      }
    }, REINTENTO_CONEXION_MS);
  }

  private async volverASeguir(): Promise<void> {
    for (const id of this.seguidos.keys()) await this.invocar('Seguir', id);
    if (this.empresa > 0) await this.invocar('SeguirEmpresa');
  }

  /** Un rechazo (p. ej. el recorrido ya terminó y es un acudiente) no rompe la conexión. */
  private async invocar(metodo: string, ...argumentos: unknown[]): Promise<void> {
    try {
      await this.conexion?.invoke(metodo, ...argumentos);
    } catch {
      /* sin acceso o desconectado: la pantalla sigue con su consulta de respaldo */
    }
  }

  private async desconectar(): Promise<void> {
    if (this.reintento) clearTimeout(this.reintento);
    this.reintento = null;
    const conexion = this.conexion ?? (await this.conectando);
    this.conexion = null;
    await conexion?.stop();
  }

  private async token(): Promise<string> {
    const tokens = this.auth.tokens();
    if (tokens && new Date(tokens.accessTokenExpira).getTime() - Date.now() < MARGEN_RENOVACION_MS) {
      try {
        await firstValueFrom(this.renovacion.renovar());
      } catch {
        /* sin renovación: el siguiente 401 del API cierra la sesión */
      }
    }
    return this.auth.tokens()?.accessToken ?? '';
  }
}
