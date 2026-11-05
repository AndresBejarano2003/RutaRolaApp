import { Injectable, signal } from '@angular/core';

/**
 * Aviso global de que algún registro se creó, modificó o eliminó (lo emite `CrudStore`).
 * Lo usan las vistas que resumen datos de varios módulos (p. ej. la campana de notificaciones)
 * para refrescarse sin esperar al siguiente sondeo.
 */
@Injectable({ providedIn: 'root' })
export class CambiosDatos {
  private readonly _version = signal(0);
  readonly version = this._version.asReadonly();

  notificar(): void {
    this._version.update((v) => v + 1);
  }
}
