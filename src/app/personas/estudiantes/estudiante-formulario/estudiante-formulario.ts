import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { Curso } from 'src/app/operacion/colegios/colegio';
import { horaLegible } from 'src/app/shared/fechas/fechas';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogosService, OpcionCatalogo, aMapa, ordenGrado } from 'src/app/shared/catalogos/catalogos';
import { DatosRegistro, ESTADOS_REGISTRO, EstadoRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { fechaNoFutura, mensajeError } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { CamposPersona } from '../../compartido/campos-persona/campos-persona';
import { controlesPersona, limpiarPersona } from '../../compartido/persona';
import { Estudiante } from '../estudiante';

/**
 * Campos para crear, editar o consultar (solo lectura) un estudiante.
 * Los botones NO van aquí: van en el pie fijo del modal (`app-acciones-formulario`).
 */
@Component({
  selector: 'app-estudiante-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, CamposPersona],
  templateUrl: './estudiante-formulario.html',
})
export class EstudianteFormulario {
  /** `id` del `<form>`; el botón Guardar del pie del modal lo usa con `form="..."`. */
  readonly idFormulario = input.required<string>();
  readonly estudiante = input<Estudiante | null>(null);
  readonly modo = input.required<ModoFormulario>();
  /** Opciones del módulo de acudientes. */
  readonly acudientes = input<OpcionCatalogo[]>([]);
  /** Opciones del módulo de colegios. */
  readonly colegios = input<OpcionCatalogo[]>([]);
  /** Cursos del colegio elegido (`null` = aún no cargan: se ofrecen todos los grados). */
  readonly cursos = input<Curso[] | null>(null);

  readonly guardar = output<DatosRegistro<Estudiante>>();
  /** Cambió el colegio: la página carga sus cursos. */
  readonly colegioCambiado = output<string>();

  protected readonly catalogos = inject(CatalogosService);
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly hoy = new Date().toISOString().slice(0, 10);
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');
  protected readonly ultimaActualizacion = computed(() => {
    const fecha = this.estudiante()?.fechaActualizacion;
    return fecha ? new Date(fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : null;
  });

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    ...controlesPersona(this.fb),
    fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    direccion: ['', [Validators.required, Validators.maxLength(120)]],
    acudienteId: ['', Validators.required],
    colegioId: ['', Validators.required],
    grado: ['', Validators.required],
    jornada: ['', Validators.required],
    estado: this.fb.control<EstadoRegistro>('ACTIVO', Validators.required),
    observaciones: ['', Validators.maxLength(500)],
  });

  private readonly gradoActual = toSignal(this.form.controls.grado.valueChanges, { initialValue: '' });

  /** Grados que ofrece el colegio (cursos activos con su horario); si no tiene cursos, todos. */
  protected readonly grados = computed<OpcionCatalogo[]>(() => {
    const cursos = this.cursos()?.filter((c) => c.estado === 'ACTIVO') ?? [];
    if (!cursos.length) {
      return this.catalogos.grados;
    }
    const nombres = aMapa(this.catalogos.grados);
    const opciones = [...cursos]
      .sort((a, b) => ordenGrado(a.grado) - ordenGrado(b.grado))
      .map((c) => ({
        id: c.grado,
        nombre: `${nombres.get(c.grado) ?? c.grado} (${horaLegible(c.horaEntrada)} – ${horaLegible(c.horaSalida)})`,
      }));
    // Conserva el grado guardado aunque el colegio ya no lo ofrezca.
    const actual = this.gradoActual() || this.form.controls.grado.value;
    return actual && !opciones.some((o) => o.id === actual) ? [{ id: actual, nombre: actual }, ...opciones] : opciones;
  });

  constructor() {
    this.form.controls.colegioId.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((colegioId) => this.colegioCambiado.emit(colegioId));

    // Carga el registro recibido y bloquea el formulario en modo consulta.
    effect(() => {
      const estudiante = this.estudiante();
      if (estudiante) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, ...datos } = estudiante;
        this.form.reset(datos);
      } else {
        this.form.reset();
      }
      if (this.soloLectura()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  protected error(campo: keyof typeof this.form.controls): string | null {
    return mensajeError(this.form.controls[campo]);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = limpiarPersona(this.form.getRawValue());
    this.guardar.emit({
      ...valores,
      direccion: valores.direccion.trim(),
      observaciones: valores.observaciones.trim(),
    });
  }
}
