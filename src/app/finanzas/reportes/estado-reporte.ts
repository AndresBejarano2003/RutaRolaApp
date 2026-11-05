import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

export interface EstadoReporte<R> {
  cargando: boolean;
  datos: R;
  error: string | null;
}

/**
 * Vuelve a consultar el reporte cada vez que cambian los filtros. Para reintentar,
 * asigna una copia de los filtros (`filtros.set({ ...filtros() })`).
 * Debe llamarse en contexto de inyección (inicialización de un campo).
 */
export function reporteEnVivo<F, R>(filtros: Signal<F>, consultar: (f: F) => Observable<R>, vacio: R): Signal<EstadoReporte<R>> {
  return toSignal(
    toObservable(filtros).pipe(
      switchMap((f) =>
        consultar(f).pipe(
          map((datos): EstadoReporte<R> => ({ cargando: false, datos, error: null })),
          startWith<EstadoReporte<R>>({ cargando: true, datos: vacio, error: null }),
          catchError(() => of<EstadoReporte<R>>({ cargando: false, datos: vacio, error: 'No fue posible generar el reporte.' })),
        ),
      ),
    ),
    { initialValue: { cargando: true, datos: vacio, error: null } },
  );
}
