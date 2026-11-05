import { Observable } from 'rxjs';
import { Tablero } from './tablero';

/** Resumen de la pantalla de inicio (implementación en `core/repositorios.ts`). */
export abstract class TableroRepositorio {
  abstract obtener(): Observable<Tablero>;
}
