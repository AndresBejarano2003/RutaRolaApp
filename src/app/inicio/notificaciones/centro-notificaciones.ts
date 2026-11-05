import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, firstValueFrom, interval } from 'rxjs';
import { CambiosDatos } from 'src/app/shared/crud/cambios-datos';
import { mensajeDeError } from 'src/app/shared/crud/crud';
import { esFuenteLocal } from 'src/app/shared/crud/repositorio-local';
import { NotificacionesService } from 'src/app/shared/notificaciones/notificaciones';
import { BandejaNotificaciones, RESUMEN_VACIO, ResumenNotificaciones } from './notificacion-sistema';
import { NotificacionesRepositorio } from './notificaciones-repositorio';

/** Cada cuánto se consulta si hay notificaciones nuevas. */
export const INTERVALO_SONDEO_MS = 60_000;

/**
 * Estado compartido por la campana (barra superior) y la página de notificaciones: el resumen
 * (no leídas, recientes) y las acciones. Toda acción refresca el resumen y sube `version`, que la
 * página observa para recargar su listado. Se provee junto a los repositorios (`core/repositorios.ts`).
 */
@Injectable()
export class CentroNotificaciones {
  private readonly repositorio = inject(NotificacionesRepositorio);
  private readonly toasts = inject(NotificacionesService);
  private readonly cambios = inject(CambiosDatos);

  private readonly _resumen = signal<ResumenNotificaciones>(RESUMEN_VACIO);
  readonly resumen = this._resumen.asReadonly();
  /** Sube cada vez que la bandeja pudo cambiar. */
  readonly version = signal(0);
  /** Hora de referencia para los textos "Hace 5 min" (se actualiza con el sondeo). */
  readonly ahora = signal(new Date());
  readonly procesando = signal(false);
  readonly modoLocal = esFuenteLocal(this.repositorio);

  constructor() {
    // Al iniciar y cada vez que se guarda o elimina un registro en cualquier módulo.
    effect(() => {
      this.cambios.version();
      untracked(() => void this.refrescar());
    });
    interval(INTERVALO_SONDEO_MS)
      .pipe(takeUntilDestroyed())
      .subscribe(() => void this.refrescar());
  }

  async refrescar(): Promise<void> {
    try {
      this._resumen.set(await firstValueFrom(this.repositorio.resumen()));
    } catch {
      // La campana conserva el último resumen; se reintenta en el siguiente sondeo.
    }
    this.ahora.set(new Date());
    this.version.update((v) => v + 1);
  }

  marcarLeidas(ids: string[], leida = true): Promise<boolean> {
    return this.ejecutar(this.repositorio.marcarLeidas(ids, leida));
  }

  marcarTodasLeidas(): Promise<boolean> {
    return this.ejecutar(this.repositorio.marcarTodasLeidas(), 'Todas las notificaciones quedaron como leídas.');
  }

  archivar(ids: string[], archivada = true): Promise<boolean> {
    const n = ids.length;
    const texto = archivada
      ? n === 1 ? 'Notificación archivada.' : `${n} notificaciones archivadas.`
      : n === 1 ? 'Notificación restaurada a la bandeja de entrada.' : `${n} notificaciones restauradas.`;
    return this.ejecutar(this.repositorio.archivar(ids, archivada), texto);
  }

  eliminar(ids: string[]): Promise<boolean> {
    const texto = ids.length === 1 ? 'Notificación eliminada.' : `${ids.length} notificaciones eliminadas.`;
    return this.ejecutar(this.repositorio.eliminar(ids), texto);
  }

  vaciar(bandeja: BandejaNotificaciones): Promise<boolean> {
    const texto = bandeja === 'ENTRADA' ? 'Bandeja de entrada vaciada.' : 'Archivadas vaciadas.';
    return this.ejecutar(this.repositorio.vaciar(bandeja), texto);
  }

  private async ejecutar(accion: Observable<void>, exito?: string): Promise<boolean> {
    this.procesando.set(true);
    try {
      await firstValueFrom(accion, { defaultValue: undefined });
      if (exito) this.toasts.exito(exito);
      await this.refrescar();
      return true;
    } catch (error) {
      this.toasts.error(mensajeDeError(error));
      return false;
    } finally {
      this.procesando.set(false);
    }
  }
}
