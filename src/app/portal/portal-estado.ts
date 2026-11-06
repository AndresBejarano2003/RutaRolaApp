import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { auditTime, firstValueFrom } from 'rxjs';
import { mensajeDeError } from 'src/app/shared/crud/crud';
import { esFuenteLocal } from 'src/app/shared/crud/repositorio-local';
import { PortalAcudiente } from './portal';
import { PortalRepositorio } from './portal-repositorio';

/** Datos del portal compartidos por sus pantallas (se cargan una vez al entrar; "Actualizar" recarga). */
@Injectable()
export class PortalEstado {
  private readonly repositorio = inject(PortalRepositorio);

  readonly modoLocal = esFuenteLocal(this.repositorio);
  readonly datos = signal<PortalAcudiente | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Recarga sin mostrar el estado de carga cada vez que cambia un recorrido de sus estudiantes. */
  escuchar(destroyRef: DestroyRef): void {
    this.repositorio
      .observarCambios()
      .pipe(auditTime(1_000), takeUntilDestroyed(destroyRef))
      .subscribe(() => void this.cargar(true));
  }

  async cargar(silencioso = false): Promise<void> {
    if (!silencioso) this.cargando.set(true);
    try {
      this.datos.set(await firstValueFrom(this.repositorio.obtener()));
      this.error.set(null);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }
}
