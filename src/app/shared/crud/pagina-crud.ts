import { Directive, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatosRegistro, Entidad, ModoFormulario } from './crud';
import { CrudStore } from './crud-store';

/**
 * Comportamiento común de toda página CRUD: modal de crear / editar /
 * consultar y eliminación con verificación de integridad.
 *
 * ```ts
 * export default class ColegiosPage extends PaginaCrud<Colegio, FiltrosColegio> {
 *   protected readonly store = inject(ColegiosStore);
 *   protected readonly titulos = { crear: 'Nuevo colegio', editar: 'Editar colegio', consultar: 'Detalle del colegio' };
 *   protected describir(c: Colegio) { return c.razonSocial; }
 * }
 * ```
 * La plantilla usa `modalAbierto`, `modo`, `seleccionado`, `cargandoDetalle`,
 * `tituloModal`, `subtituloModal`, `confirmacionAbierta`, `mensajeEliminar`,
 * `puedeEliminar`, `verificandoEliminar` y los métodos `nuevo`, `abrir`,
 * `guardar`, `pedirEliminar`, `confirmarEliminar`.
 *
 * Con `?accion=nuevo` en la URL (p. ej. desde los accesos rápidos del inicio) abre el formulario de creación.
 */
@Directive()
export abstract class PaginaCrud<T extends Entidad, F extends object> implements OnInit {
  protected abstract readonly store: CrudStore<T, F>;
  protected abstract readonly titulos: Record<ModoFormulario, string>;

  /** Cómo se nombra el registro en el subtítulo del modal y en los mensajes. */
  protected abstract describir(registro: T): string;

  // Modal de crear / editar / consultar
  protected readonly modalAbierto = signal(false);
  protected readonly modo = signal<ModoFormulario>('crear');
  protected readonly seleccionado = signal<T | null>(null);
  protected readonly cargandoDetalle = signal(false);
  protected readonly tituloModal = computed(() => this.titulos[this.modo()]);
  protected readonly subtituloModal = computed(() => {
    const registro = this.seleccionado();
    return registro && this.modo() !== 'crear' ? this.describir(registro) : '';
  });

  // Eliminación: `undefined` = verificando, `null` = permitida, texto = motivo del bloqueo.
  protected readonly confirmacionAbierta = signal(false);
  protected readonly porEliminar = signal<T | null>(null);
  protected readonly bloqueoEliminar = signal<string | null | undefined>(null);
  protected readonly verificandoEliminar = computed(() => this.bloqueoEliminar() === undefined);
  protected readonly puedeEliminar = computed(() => this.bloqueoEliminar() === null);
  protected readonly mensajeEliminar = computed(() => {
    const registro = this.porEliminar();
    const bloqueo = this.bloqueoEliminar();
    if (!registro) return '';
    if (bloqueo === undefined) return 'Verificando si el registro está en uso...';
    if (bloqueo) return bloqueo;
    return `Se eliminará ${this.describir(registro)}. Esta acción no se puede deshacer.`;
  });

  private readonly ruta = inject(ActivatedRoute, { optional: true });

  ngOnInit(): void {
    this.store.recargar();
    if (this.ruta?.snapshot.queryParamMap.get('accion') === 'nuevo') {
      this.nuevo();
    }
  }

  protected nuevo(): void {
    this.modo.set('crear');
    this.seleccionado.set(null);
    this.modalAbierto.set(true);
  }

  protected async abrir(modo: 'consultar' | 'editar', registro: T): Promise<void> {
    this.modo.set(modo);
    this.seleccionado.set(registro);
    this.modalAbierto.set(true);

    // Trae el registro completo (con el API puede tener más datos que el listado).
    this.cargandoDetalle.set(true);
    const detalle = await this.store.obtener(registro.id);
    this.cargandoDetalle.set(false);
    if (detalle) {
      this.seleccionado.set(detalle);
    } else {
      this.modalAbierto.set(false);
      this.store.recargar();
    }
  }

  protected async guardar(datos: DatosRegistro<T>): Promise<void> {
    const id = this.modo() === 'editar' ? (this.seleccionado()?.id ?? null) : null;
    if (await this.store.guardar(datos, id)) {
      this.modalAbierto.set(false);
    }
  }

  protected async pedirEliminar(registro: T): Promise<void> {
    this.porEliminar.set(registro);
    this.bloqueoEliminar.set(undefined);
    this.confirmacionAbierta.set(true);
    this.bloqueoEliminar.set(await this.store.motivoNoEliminar(registro.id));
  }

  protected async confirmarEliminar(): Promise<void> {
    const registro = this.porEliminar();
    if (registro && (await this.store.eliminar(registro.id))) {
      this.confirmacionAbierta.set(false);
    }
  }
}
