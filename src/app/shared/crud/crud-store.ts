import { DestroyRef, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, firstValueFrom, of, switchMap, tap } from 'rxjs';
import { NotificacionesService } from '../notificaciones/notificaciones';
import { DatosRegistro, Entidad, Pagina, Paginacion, mensajeDeError } from './crud';
import { RepositorioCrud } from './repositorio-crud';
import { RepositorioLocal } from './repositorio-local';

export interface TextosCrud {
  creado: string;
  actualizado: string;
  eliminado: string;
}

export const TAMANOS_PAGINA = [10, 25, 50] as const;

/**
 * Estado de una pantalla CRUD (listado, filtros, paginación, guardado)
 * basado en signals. Cada módulo crea su store extendiendo esta clase y
 * lo provee en el componente de la página (`providers: [XStore]`).
 */
export abstract class CrudStore<T extends Entidad, F extends object> {
  protected abstract readonly repositorio: RepositorioCrud<T, F>;
  protected abstract readonly textos: TextosCrud;

  private readonly notificaciones = inject(NotificacionesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly solicitudes = new Subject<void>();

  private readonly _pagina = signal<Pagina<T>>({ items: [], total: 0, pagina: 1, tamano: TAMANOS_PAGINA[0] });
  private readonly _cargando = signal(false);
  private readonly _guardando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly filtros: WritableSignal<F>;
  readonly paginacion = signal<Paginacion>({ pagina: 1, tamano: TAMANOS_PAGINA[0] });

  readonly items: Signal<T[]> = computed(() => this._pagina().items);
  readonly total = computed(() => this._pagina().total);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.paginacion().tamano)));
  readonly cargando = this._cargando.asReadonly();
  readonly guardando = this._guardando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hayFiltros = computed(() =>
    Object.entries(this.filtros()).some(([clave, valor]) => valor !== (this.filtrosIniciales as Record<string, unknown>)[clave]),
  );

  constructor(private readonly filtrosIniciales: F) {
    this.filtros = signal(filtrosIniciales);

    // switchMap: si llega una búsqueda nueva, se descarta la respuesta anterior.
    this.solicitudes
      .pipe(
        tap(() => {
          this._cargando.set(true);
          this._error.set(null);
        }),
        switchMap(() =>
          this.repositorio.listar(this.filtros(), this.paginacion()).pipe(
            catchError((error: unknown) => {
              this._error.set(mensajeDeError(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((pagina) => {
        this._cargando.set(false);
        if (pagina) {
          this._pagina.set(pagina);
        }
      });
  }

  /** `true` si los datos se guardan en el navegador (todavía sin API). */
  get modoLocal(): boolean {
    return this.repositorio instanceof RepositorioLocal;
  }

  recargar(): void {
    this.solicitudes.next();
  }

  buscar(filtros: F): void {
    this.filtros.set(filtros);
    this.paginacion.update((p) => ({ ...p, pagina: 1 }));
    this.recargar();
  }

  irAPagina(pagina: number): void {
    this.paginacion.update((p) => ({ ...p, pagina: Math.min(Math.max(1, pagina), this.totalPaginas()) }));
    this.recargar();
  }

  cambiarTamano(tamano: number): void {
    this.paginacion.set({ pagina: 1, tamano });
    this.recargar();
  }

  /** Obtiene el registro completo (para consultar/editar). `null` si falla. */
  async obtener(id: string): Promise<T | null> {
    try {
      return await firstValueFrom(this.repositorio.obtener(id));
    } catch (error) {
      this.notificaciones.error(mensajeDeError(error));
      return null;
    }
  }

  /** Crea (`id === null`) o actualiza. Devuelve `true` si se guardó. */
  async guardar(datos: DatosRegistro<T>, id: string | null): Promise<boolean> {
    this._guardando.set(true);
    try {
      await firstValueFrom(id ? this.repositorio.actualizar(id, datos) : this.repositorio.crear(datos));
      this.notificaciones.exito(id ? this.textos.actualizado : this.textos.creado);
      this.recargar();
      return true;
    } catch (error) {
      this.notificaciones.error(mensajeDeError(error));
      return false;
    } finally {
      this._guardando.set(false);
    }
  }

  async eliminar(id: string): Promise<boolean> {
    this._guardando.set(true);
    try {
      await firstValueFrom(this.repositorio.eliminar(id));
      this.notificaciones.exito(this.textos.eliminado);
      // Si se borró el último registro de la página, retroceder una.
      const { pagina } = this.paginacion();
      if (this.items().length === 1 && pagina > 1) {
        this.paginacion.update((p) => ({ ...p, pagina: pagina - 1 }));
      }
      this.recargar();
      return true;
    } catch (error) {
      this.notificaciones.error(mensajeDeError(error));
      return false;
    } finally {
      this._guardando.set(false);
    }
  }
}
