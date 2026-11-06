import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, auditTime, firstValueFrom, interval } from 'rxjs';
import { TRAYECTOS, Trayecto } from 'src/app/ruta-del-dia/recorrido';
import { RecorridoEnMapa, haceCuanto } from 'src/app/ruta-del-dia/gps/gps';
import { GpsRepositorio } from 'src/app/ruta-del-dia/gps/gps-repositorio';
import { mensajeDeError } from 'src/app/shared/crud/crud';
import { esFuenteLocal } from 'src/app/shared/crud/repositorio-local';
import { Mapa, MarcadorMapa } from 'src/app/shared/mapa/mapa';

/** Sin posición nueva en este tiempo, el vehículo se marca "sin señal". */
const SIN_SENAL_MS = 3 * 60_000;

/**
 * Monitoreo en vivo (administrador): recorridos EN CURSO de la empresa en el mapa, con la posición que
 * envía el teléfono de la monitora (o del conductor). Las posiciones llegan por el hub; cuando un
 * recorrido inicia, cambia o termina se vuelve a pedir la lista.
 */
@Component({
  selector: 'app-monitoreo-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Mapa, RouterLink],
  templateUrl: './monitoreo-page.html',
})
export default class MonitoreoPage implements OnInit {
  private readonly gps = inject(GpsRepositorio);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly modoLocal = esFuenteLocal(this.gps);

  protected readonly recorridos = signal<RecorridoEnMapa[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly seleccionado = signal<string | null>(null);
  /** Hace que "hace X min" y "sin señal" se recalculen. */
  private readonly ahora = signal(Date.now());
  private readonly recargar$ = new Subject<void>();

  protected readonly conPosicion = computed(() => this.recorridos().filter((r) => r.posicion).length);
  protected readonly marcadores = computed((): MarcadorMapa[] =>
    this.recorridos().flatMap((r) =>
      r.posicion
        ? [
            {
              id: r.recorridoId,
              tipo: 'vehiculo' as const,
              latitud: r.posicion.latitud,
              longitud: r.posicion.longitud,
              etiqueta: `${r.ruta} · ${r.vehiculo}`,
              activo: r.recorridoId === this.seleccionado(),
              desactualizado: this.sinSenal(r),
            },
          ]
        : [],
    ),
  );

  ngOnInit(): void {
    void this.cargar();
    this.recargar$.pipe(auditTime(1_000), takeUntilDestroyed(this.destroyRef)).subscribe(() => void this.cargar(false));
    this.gps
      .observarEmpresa()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => {
        if (!p) return this.recargar$.next();
        const existe = this.recorridos().some((r) => r.recorridoId === p.recorridoId);
        if (!existe) return this.recargar$.next();
        this.recorridos.update((lista) => lista.map((r) => (r.recorridoId === p.recorridoId ? { ...r, posicion: p } : r)));
      });
    interval(30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.ahora.set(Date.now()));
  }

  protected async cargar(mostrarCarga = true): Promise<void> {
    if (mostrarCarga) this.cargando.set(true);
    try {
      this.recorridos.set(await firstValueFrom(this.gps.enCurso()));
      this.error.set(null);
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  protected seleccionar(id: string): void {
    this.seleccionado.set(this.seleccionado() === id ? null : id);
  }

  protected sinSenal(r: RecorridoEnMapa): boolean {
    return !r.posicion || this.ahora() - new Date(r.posicion.fecha).getTime() > SIN_SENAL_MS;
  }

  protected ultima(r: RecorridoEnMapa): string {
    this.ahora();
    return r.posicion ? haceCuanto(r.posicion.fecha) : '';
  }

  protected nombreTrayecto(t: Trayecto): string {
    return TRAYECTOS.find((x) => x.id === t)?.nombre ?? t;
  }
}
