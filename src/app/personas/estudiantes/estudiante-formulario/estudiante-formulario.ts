import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/shared/catalogos/catalogos';
import { DatosRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { fechaNoFutura, mensajeError } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { ESTADOS_ESTUDIANTE, EstadoEstudiante, Estudiante } from '../estudiante';

const NOMBRE = [Validators.required, Validators.maxLength(50)];

/**
 * Campos para crear, editar o consultar (solo lectura) un estudiante.
 * Los botones NO van aquí: van en el pie fijo del modal (`app-acciones-formulario`).
 */
@Component({
  selector: 'app-estudiante-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda],
  templateUrl: './estudiante-formulario.html',
})
export class EstudianteFormulario {
  /** `id` del `<form>`; el botón Guardar del pie del modal lo usa con `form="..."`. */
  readonly idFormulario = input.required<string>();
  readonly estudiante = input<Estudiante | null>(null);
  readonly modo = input.required<ModoFormulario>();

  readonly guardar = output<DatosRegistro<Estudiante>>();

  protected readonly catalogos = inject(CatalogosService);
  protected readonly estados = ESTADOS_ESTUDIANTE;
  protected readonly hoy = new Date().toISOString().slice(0, 10);
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');
  protected readonly ultimaActualizacion = computed(() => {
    const fecha = this.estudiante()?.fechaActualizacion;
    return fecha ? new Date(fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : null;
  });

  protected readonly form = inject(NonNullableFormBuilder).group({
    tipoDocumento: ['', Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{5,15}$/)]],
    primerNombre: ['', NOMBRE],
    segundoNombre: ['', Validators.maxLength(50)],
    primerApellido: ['', NOMBRE],
    segundoApellido: ['', Validators.maxLength(50)],
    fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    direccion: ['', [Validators.required, Validators.maxLength(120)]],
    acudienteId: ['', Validators.required],
    colegioId: ['', Validators.required],
    grado: ['', Validators.required],
    jornada: ['', Validators.required],
    estado: ['ACTIVO' as EstadoEstudiante, Validators.required],
    observaciones: ['', Validators.maxLength(500)],
  });

  constructor() {
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
    const valores = this.form.getRawValue();
    this.guardar.emit({
      ...valores,
      numeroDocumento: valores.numeroDocumento.trim(),
      primerNombre: valores.primerNombre.trim(),
      segundoNombre: valores.segundoNombre.trim(),
      primerApellido: valores.primerApellido.trim(),
      segundoApellido: valores.segundoApellido.trim(),
      direccion: valores.direccion.trim(),
      observaciones: valores.observaciones.trim(),
    });
  }
}
