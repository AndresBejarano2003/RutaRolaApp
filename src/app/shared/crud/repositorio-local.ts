import { InjectionToken, inject } from '@angular/core';
import { Observable, defer, delay, of, switchMap, throwError } from 'rxjs';
import { DatosRegistro, Entidad, ErrorCrud, Pagina, Paginacion } from './crud';
import { OpcionCatalogo } from '../catalogos/catalogos';
import { RepositorioCrud } from './repositorio-crud';

/** Latencia simulada (ms) de los repositorios locales. Las pruebas la ponen en 0. */
export const LATENCIA_LOCAL = new InjectionToken<number>('LATENCIA_LOCAL', {
  providedIn: 'root',
  factory: () => 300,
});

/** Marca de las fuentes de datos temporales (muestra el indicador "Modo local"). */
export interface FuenteLocal {
  readonly modoLocal: true;
}

export function esFuenteLocal(fuente: object): boolean {
  return 'modoLocal' in fuente;
}

/** Ejecuta una operación de forma asíncrona y devuelve una copia, como haría un API. */
export function responderLocal<R>(operacion: () => R, latenciaMs: number): Observable<R> {
  return defer(() => of(structuredClone(operacion()))).pipe(delay(latenciaMs));
}

/** Todos los registros (sin paginar) para cálculos locales entre módulos. */
export const SIN_PAGINAR: Paginacion = { pagina: 1, tamano: Number.MAX_SAFE_INTEGER };

/**
 * Implementación TEMPORAL que guarda los registros en `localStorage`
 * mientras se construye el API. Simula latencia para que la interfaz
 * (cargas, botones deshabilitados) se comporte igual que con HTTP.
 */
export abstract class RepositorioLocal<T extends Entidad, F> extends RepositorioCrud<T, F> implements FuenteLocal {
  readonly modoLocal = true as const;

  /** Clave de `localStorage` donde se guardan los registros. */
  protected abstract readonly clave: string;

  /** Filtros vacíos (base para `opciones(filtros)`). */
  protected abstract readonly filtrosVacios: F;

  /** Registros de ejemplo que se cargan la primera vez. */
  protected abstract datosIniciales(): T[];

  /** ¿El registro cumple los filtros? */
  protected abstract coincide(registro: T, filtros: F): boolean;

  /** Texto que identifica al registro en listas de selección. */
  protected abstract etiquetaOpcion(registro: T): string;

  /** Orden del listado. */
  protected ordenar(_a: T, _b: T): number {
    return 0;
  }

  /** Reglas de negocio del mismo recurso (p. ej. duplicados). Lanza `ErrorCrud` si no se cumplen. */
  protected validar(_datos: DatosRegistro<T>, _idActual: string | null, _registros: T[]): void {}

  /**
   * Reglas que dependen de OTROS módulos (p. ej. capacidad del vehículo).
   * Emite y completa si todo está bien; si no, falla con `ErrorCrud`.
   */
  protected validarRelaciones(_datos: DatosRegistro<T>, _idActual: string | null): Observable<unknown> {
    return of(null);
  }

  /** Completa datos generados por el "servidor" (p. ej. consecutivos) antes de guardar. */
  protected preparar(datos: DatosRegistro<T>, _idActual: string | null, _registros: T[]): DatosRegistro<T> {
    return datos;
  }

  protected readonly latenciaMs = inject(LATENCIA_LOCAL);

  listar(filtros: F, { pagina, tamano }: Paginacion): Observable<Pagina<T>> {
    return this.responder(() => {
      const filtrados = this.leer()
        .filter((registro) => this.coincide(registro, filtros))
        .sort((a, b) => this.ordenar(a, b));
      const inicio = (pagina - 1) * tamano;
      return { items: filtrados.slice(inicio, inicio + tamano), total: filtrados.length, pagina, tamano };
    });
  }

  obtener(id: string): Observable<T> {
    return this.responder(() => this.buscar(this.leer(), id));
  }

  crear(datos: DatosRegistro<T>): Observable<T> {
    return this.validarRelaciones(datos, null).pipe(
      switchMap(() =>
        this.responder(() => {
          const registros = this.leer();
          this.validar(datos, null, registros);
          const ahora = new Date().toISOString();
          const nuevo = {
            ...this.preparar(datos, null, registros),
            id: crypto.randomUUID(),
            fechaCreacion: ahora,
            fechaActualizacion: ahora,
          } as T;
          this.escribir([nuevo, ...registros]);
          return nuevo;
        }),
      ),
    );
  }

  actualizar(id: string, datos: DatosRegistro<T>): Observable<T> {
    return this.validarRelaciones(datos, id).pipe(
      switchMap(() =>
        this.responder(() => {
          const registros = this.leer();
          const actual = this.buscar(registros, id);
          this.validar(datos, id, registros);
          const actualizado = {
            ...actual,
            ...this.preparar(datos, id, registros),
            id,
            fechaActualizacion: new Date().toISOString(),
          } as T;
          this.escribir(registros.map((r) => (r.id === id ? actualizado : r)));
          return actualizado;
        }),
      ),
    );
  }

  eliminar(id: string): Observable<void> {
    return this.motivoNoEliminar(id).pipe(
      switchMap((motivo) =>
        motivo
          ? throwError(() => new ErrorCrud(motivo, 'EN_USO'))
          : this.responder(() => {
              const registros = this.leer();
              this.buscar(registros, id);
              this.escribir(registros.filter((r) => r.id !== id));
            }),
      ),
    );
  }

  opciones(filtros: Partial<F> = {}): Observable<OpcionCatalogo[]> {
    const criterio = { ...this.filtrosVacios, ...filtros };
    return this.responder(() =>
      this.leer()
        .filter((r) => this.coincide(r, criterio))
        .map((r) => ({ id: r.id, nombre: this.etiquetaOpcion(r) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    );
  }

  private buscar(registros: T[], id: string): T {
    const registro = registros.find((r) => r.id === id);
    if (!registro) {
      throw new ErrorCrud('El registro no existe o fue eliminado.', 'NO_ENCONTRADO');
    }
    return registro;
  }

  /** Todos los registros guardados (sin copiar): usar solo dentro de `responder`. */
  protected leer(): T[] {
    try {
      const guardado = localStorage.getItem(this.clave);
      if (guardado !== null) {
        return JSON.parse(guardado) as T[];
      }
    } catch {
      // Almacenamiento no disponible o corrupto: se reinicia con los datos de ejemplo.
    }
    const iniciales = this.datosIniciales();
    try {
      this.escribir(iniciales);
    } catch {
      // Sin almacenamiento se trabaja solo en memoria con los datos de ejemplo.
    }
    return iniciales;
  }

  private escribir(registros: T[]): void {
    try {
      localStorage.setItem(this.clave, JSON.stringify(registros));
    } catch {
      // Normalmente es la cuota del navegador (~5 MB), p. ej. por archivos adjuntos grandes.
      throw new ErrorCrud(
        'No hay espacio en el almacenamiento temporal del navegador. Elimina archivos adjuntos o registros de prueba.',
        'SIN_ESPACIO',
      );
    }
  }

  protected responder<R>(operacion: () => R): Observable<R> {
    return responderLocal(operacion, this.latenciaMs);
  }
}
