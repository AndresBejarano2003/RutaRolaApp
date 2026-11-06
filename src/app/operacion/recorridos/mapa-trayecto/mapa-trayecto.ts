import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { PosicionGps, haceCuanto } from 'src/app/ruta-del-dia/gps/gps';
import { GpsRepositorio } from 'src/app/ruta-del-dia/gps/gps-repositorio';
import { mensajeDeError } from 'src/app/shared/crud/crud';
import { Mapa, MarcadorMapa } from 'src/app/shared/mapa/mapa';

/** Trayecto GPS de un recorrido (detalle del historial). Si sigue en curso, se actualiza en vivo. */
@Component({
  selector: 'app-mapa-trayecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Mapa],
  template: `
    @if (cargando()) {
      <div class="skeleton h-64 w-full"></div>
    } @else if (error()) {
      <p class="text-sm text-error">{{ error() }}</p>
    } @else if (puntos().length === 0) {
      <p class="text-sm text-base-content/70 flex items-center gap-2">
        <i class="fa-solid fa-location-pin-lock" aria-hidden="true"></i>
        No hay ubicaciones de este recorrido (no se compartió el GPS o ya pasaron los días de conservación).
      </p>
    } @else {
      <app-mapa class="h-64 sm:h-80" titulo="Trayecto del recorrido" [marcadores]="marcadores()" [trayecto]="linea()" />
      <p class="mt-1 text-xs text-base-content/70">
        {{ puntos().length }} ubicaciones · última {{ haceCuanto(puntos().at(-1)!.fecha) }}
      </p>
    }
  `,
})
export class MapaTrayecto implements OnInit {
  readonly recorridoId = input.required<string>();
  readonly enCurso = input(false);

  private readonly gps = inject(GpsRepositorio);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly haceCuanto = haceCuanto;
  protected readonly puntos = signal<PosicionGps[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly linea = computed(() => this.puntos().map((p): [number, number] => [p.latitud, p.longitud]));
  protected readonly marcadores = computed((): MarcadorMapa[] => {
    const lista = this.puntos();
    if (lista.length === 0) return [];
    const primero = lista[0];
    const ultimo = lista[lista.length - 1];
    return [
      { id: 'inicio', tipo: 'inicio', latitud: primero.latitud, longitud: primero.longitud, etiqueta: 'Inicio del trayecto' },
      { id: 'vehiculo', tipo: 'vehiculo', activo: true, latitud: ultimo.latitud, longitud: ultimo.longitud, etiqueta: ultimo.vehiculo || 'Vehículo' },
    ];
  });

  async ngOnInit(): Promise<void> {
    try {
      this.puntos.set(await firstValueFrom(this.gps.trayecto(this.recorridoId())));
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
    if (this.enCurso()) {
      this.gps
        .observar(this.recorridoId())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((p) => this.puntos.update((l) => (l.at(-1)?.fecha === p.fecha ? l : [...l, p])));
    }
  }
}
