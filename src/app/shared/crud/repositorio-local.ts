import { Observable, defer, delay, of } from 'rxjs';
import { DatosRegistro, Entidad, ErrorCrud, Pagina, Paginacion } from './crud';
import { RepositorioCrud } from './repositorio-crud';

/**
 * Implementación TEMPORAL que guarda los registros en `localStorage`
 * mientras se construye el API. Simula latencia para que la interfaz
 * (cargas, botones deshabilitados) se comporte igual que con HTTP.
 */
export abstract class RepositorioLocal<T extends Entidad, F> extends RepositorioCrud<T, F> {
  /** Clave de `localStorage` donde se guardan los registros. */
  protected abstract readonly clave: string;

  /** Registros de ejemplo que se cargan la primera vez. */
  protected abstract datosIniciales(): T[];

  /** ¿El registro cumple los filtros? */
  protected abstract coincide(registro: T, filtros: F): boolean;

  /** Orden del listado. */
  protected ordenar(_a: T, _b: T): number {
    return 0;
  }

  /** Reglas de negocio (p. ej. duplicados). Lanza `ErrorCrud` si no se cumplen. */
  protected validar(_datos: DatosRegistro<T>, _idActual: string | null, _registros: T[]): void {}

  protected latenciaMs = 300;

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
    return this.responder(() => {
      const registros = this.leer();
      this.validar(datos, null, registros);
      const ahora = new Date().toISOString();
      const nuevo = { ...datos, id: crypto.randomUUID(), fechaCreacion: ahora, fechaActualizacion: ahora } as T;
      this.escribir([nuevo, ...registros]);
      return nuevo;
    });
  }

  actualizar(id: string, datos: DatosRegistro<T>): Observable<T> {
    return this.responder(() => {
      const registros = this.leer();
      const actual = this.buscar(registros, id);
      this.validar(datos, id, registros);
      const actualizado = { ...actual, ...datos, id, fechaActualizacion: new Date().toISOString() } as T;
      this.escribir(registros.map((r) => (r.id === id ? actualizado : r)));
      return actualizado;
    });
  }

  eliminar(id: string): Observable<void> {
    return this.responder(() => {
      const registros = this.leer();
      this.buscar(registros, id);
      this.escribir(registros.filter((r) => r.id !== id));
    });
  }

  private buscar(registros: T[], id: string): T {
    const registro = registros.find((r) => r.id === id);
    if (!registro) {
      throw new ErrorCrud('El registro no existe o fue eliminado.', 'NO_ENCONTRADO');
    }
    return registro;
  }

  private leer(): T[] {
    try {
      const guardado = localStorage.getItem(this.clave);
      if (guardado !== null) {
        return JSON.parse(guardado) as T[];
      }
    } catch {
      // Almacenamiento no disponible o corrupto: se reinicia con los datos de ejemplo.
    }
    const iniciales = this.datosIniciales();
    this.escribir(iniciales);
    return iniciales;
  }

  private escribir(registros: T[]): void {
    try {
      localStorage.setItem(this.clave, JSON.stringify(registros));
    } catch {
      // Sin almacenamiento los cambios se pierden al recargar; la interfaz sigue funcionando.
    }
  }

  /** Ejecuta la operación de forma asíncrona y devuelve copias (como haría un API). */
  private responder<R>(operacion: () => R): Observable<R> {
    return defer(() => of(structuredClone(operacion()))).pipe(delay(this.latenciaMs));
  }
}
