import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DialogoConfirmacion } from 'src/app/shared/dialogo-confirmacion/dialogo-confirmacion';
import { EstadoVacio } from 'src/app/shared/estado-vacio/estado-vacio';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { CentroNotificaciones } from './centro-notificaciones';
import {
  BandejaNotificaciones,
  CATEGORIAS_NOTIFICACION,
  CategoriaNotificacion,
  ESTADOS_LECTURA,
  FILTROS_NOTIFICACION_VACIOS,
  FiltrosNotificacion,
  GrupoFecha,
  NIVELES_NOTIFICACION,
  NivelNotificacion,
  NotificacionSistema,
  categoria,
  grupoFecha,
  nivel,
  tiempoRelativo,
} from './notificacion-sistema';
import { NotificacionesStore } from './notificaciones-store';

type Confirmacion = { tipo: 'eliminar'; ids: string[] } | { tipo: 'vaciar' };

/** Centro de notificaciones: bandeja de entrada y archivadas, con filtros, selección múltiple y detalle expandible. */
@Component({
  selector: 'app-notificaciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, PanelFiltros, SelectorBusqueda, Paginacion, EstadoVacio, DialogoConfirmacion],
  providers: [NotificacionesStore],
  templateUrl: './notificaciones-page.html',
})
export default class NotificacionesPage {
  protected readonly store = inject(NotificacionesStore);
  protected readonly centro = inject(CentroNotificaciones);

  protected readonly categorias = CATEGORIAS_NOTIFICACION;
  protected readonly niveles = NIVELES_NOTIFICACION;
  protected readonly lecturas = ESTADOS_LECTURA;
  protected readonly categoria = categoria;
  protected readonly nivel = nivel;

  protected readonly filtros = inject(NonNullableFormBuilder).group({
    texto: FILTROS_NOTIFICACION_VACIOS.texto,
    categoria: FILTROS_NOTIFICACION_VACIOS.categoria as CategoriaNotificacion | '',
    nivel: FILTROS_NOTIFICACION_VACIOS.nivel as NivelNotificacion | '',
    lectura: FILTROS_NOTIFICACION_VACIOS.lectura as FiltrosNotificacion['lectura'],
  });

  protected readonly bandeja = signal<BandejaNotificaciones>('ENTRADA');
  protected readonly expandida = signal<string | null>(null);
  protected readonly seleccion = signal<ReadonlySet<string>>(new Set());
  protected readonly confirmacion = signal<Confirmacion | null>(null);
  protected readonly dialogoAbierto = signal(false);

  protected readonly grupos = computed(() => {
    const ahora = this.centro.ahora();
    const grupos: { nombre: GrupoFecha; items: NotificacionSistema[] }[] = [];
    for (const n of this.store.items()) {
      const nombre = grupoFecha(n.fecha, ahora);
      const ultimo = grupos.at(-1);
      if (ultimo?.nombre === nombre) ultimo.items.push(n);
      else grupos.push({ nombre, items: [n] });
    }
    return grupos;
  });

  protected readonly todasSeleccionadas = computed(
    () => this.store.items().length > 0 && this.store.items().every((n) => this.seleccion().has(n.id)),
  );
  protected readonly algunaSeleccionada = computed(() => this.seleccion().size > 0);

  protected readonly mensajeConfirmacion = computed(() => {
    const c = this.confirmacion();
    if (!c) return '';
    if (c.tipo === 'eliminar') {
      return c.ids.length === 1
        ? 'Se eliminará la notificación seleccionada. Esta acción no se puede deshacer.'
        : `Se eliminarán ${c.ids.length} notificaciones. Esta acción no se puede deshacer.`;
    }
    return this.bandeja() === 'ENTRADA'
      ? 'Se eliminarán TODAS las notificaciones de la bandeja de entrada (no las archivadas), aunque haya filtros aplicados. Esta acción no se puede deshacer.'
      : 'Se eliminarán TODAS las notificaciones archivadas. Esta acción no se puede deshacer.';
  });

  /** `?abrir=<id>` (desde la campana): muestra la notificación expandida. */
  private readonly abrir = toSignal(inject(ActivatedRoute).queryParamMap.pipe(map((p) => p.get('abrir'))));

  constructor() {
    emitirEnVivo<Omit<FiltrosNotificacion, 'bandeja'>>(this.filtros, { emit: () => this.buscar() });

    // Recarga al iniciar y cada vez que la bandeja cambia (acciones, sondeo, datos nuevos).
    effect(() => {
      this.centro.version();
      untracked(() => this.store.recargar());
    });

    effect(() => {
      const id = this.abrir();
      if (!id) return;
      untracked(() => {
        this.filtros.reset(undefined, { emitEvent: false });
        this.bandeja.set('ENTRADA');
        this.buscar();
        this.expandida.set(id);
      });
    });
  }

  protected tiempo(fecha: string): string {
    return tiempoRelativo(fecha, this.centro.ahora());
  }

  protected fechaCompleta(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' });
  }

  protected cambiarBandeja(bandeja: BandejaNotificaciones): void {
    this.bandeja.set(bandeja);
    this.buscar();
  }

  protected limpiarFiltros(): void {
    this.filtros.reset();
  }

  protected alternarExpandida(n: NotificacionSistema): void {
    const abrir = this.expandida() !== n.id;
    this.expandida.set(abrir ? n.id : null);
    if (abrir && !n.leida) void this.centro.marcarLeidas([n.id]);
  }

  // Selección múltiple
  protected alternarSeleccion(id: string): void {
    this.seleccion.update((actual) => {
      const nueva = new Set(actual);
      if (!nueva.delete(id)) nueva.add(id);
      return nueva;
    });
  }

  protected alternarTodas(): void {
    this.seleccion.set(this.todasSeleccionadas() ? new Set() : new Set(this.store.items().map((n) => n.id)));
  }

  // Acciones de una notificación
  protected alternarLeida(n: NotificacionSistema): void {
    void this.centro.marcarLeidas([n.id], !n.leida);
  }

  protected archivar(n: NotificacionSistema): void {
    void this.centro.archivar([n.id], !n.archivada);
  }

  protected eliminar(n: NotificacionSistema): void {
    void this.centro.eliminar([n.id]);
  }

  // Acciones sobre la selección
  protected async marcarSeleccion(leida: boolean): Promise<void> {
    if (await this.centro.marcarLeidas([...this.seleccion()], leida)) this.seleccion.set(new Set());
  }

  protected async archivarSeleccion(): Promise<void> {
    if (await this.centro.archivar([...this.seleccion()], this.bandeja() === 'ENTRADA')) this.seleccion.set(new Set());
  }

  protected pedirEliminarSeleccion(): void {
    this.confirmacion.set({ tipo: 'eliminar', ids: [...this.seleccion()] });
    this.dialogoAbierto.set(true);
  }

  protected pedirVaciar(): void {
    this.confirmacion.set({ tipo: 'vaciar' });
    this.dialogoAbierto.set(true);
  }

  protected async confirmar(): Promise<void> {
    const c = this.confirmacion();
    if (!c) return;
    const ok = c.tipo === 'eliminar' ? await this.centro.eliminar(c.ids) : await this.centro.vaciar(this.bandeja());
    if (ok) {
      this.seleccion.set(new Set());
      this.dialogoAbierto.set(false);
    }
  }

  private buscar(): void {
    this.seleccion.set(new Set());
    this.expandida.set(null);
    this.store.buscar({ ...this.filtros.getRawValue(), bandeja: this.bandeja() });
  }
}
