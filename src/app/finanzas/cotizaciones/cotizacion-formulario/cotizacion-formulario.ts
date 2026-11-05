import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { Campo, TituloSeccion } from 'src/app/shared/campo/campo';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { DatosRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { fechaIso } from 'src/app/shared/fechas/fechas';
import { mensajeError, telefono } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { Cotizacion, ESTADOS_COTIZACION, EstadoCotizacion, EstudianteCotizado, calcularTotal } from '../cotizacion';

/**
 * Cotización para un acudiente registrado (se eligen acudiente y sus
 * estudiantes) o para un cliente nuevo (se escriben los nombres). Los
 * estudiantes se agregan a una tabla y el total = valor por estudiante ×
 * cantidad de estudiantes.
 */
@Component({
  selector: 'app-cotizacion-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, SelectorBusqueda, Campo, TituloSeccion, CurrencyPipe],
  templateUrl: './cotizacion-formulario.html',
})
export class CotizacionFormulario {
  readonly idFormulario = input.required<string>();
  readonly cotizacion = input<Cotizacion | null>(null);
  readonly modo = input.required<ModoFormulario>();
  readonly acudientes = input<OpcionCatalogo[]>([]);
  /** Estudiantes del acudiente elegido. */
  readonly estudiantesAcudiente = input<OpcionCatalogo[]>([]);

  readonly guardar = output<DatosRegistro<Cotizacion>>();
  readonly acudienteCambiado = output<string>();

  protected readonly estados = ESTADOS_COTIZACION;
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    fecha: [fechaIso(), Validators.required],
    registrados: this.fb.control(true),
    acudienteId: [''],
    nombreAcudiente: [''],
    telefonoAcudiente: ['', telefono],
    estudiantes: this.fb.control<EstudianteCotizado[]>([], Validators.minLength(1)),
    valorPorEstudiante: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    estado: this.fb.control<EstadoCotizacion>('PENDIENTE', Validators.required),
    observaciones: ['', Validators.maxLength(500)],
  });

  // Campos para agregar un estudiante a la tabla (no se guardan directamente).
  protected readonly estudianteElegido = signal('');
  protected readonly nombreNuevo = signal('');
  protected readonly errorAgregar = signal<string | null>(null);

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly registrados = computed(() => this.valores().registrados ?? true);
  protected readonly lista = computed(() => this.valores().estudiantes ?? []);
  protected readonly total = computed(() => calcularTotal(this.valores().valorPorEstudiante ?? 0, this.lista().length));
  protected readonly disponibles = computed(() => {
    const elegidos = new Set(this.lista().map((e) => e.estudianteId));
    return this.estudiantesAcudiente().filter((o) => !elegidos.has(o.id));
  });

  private reiniciando = false;

  constructor() {
    this.form.controls.acudienteId.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe((id) => {
      if (!this.reiniciando) {
        // Otro acudiente: los estudiantes elegidos eran del anterior.
        this.form.controls.estudiantes.setValue([]);
      }
      this.acudienteCambiado.emit(id);
    });
    this.form.controls.registrados.valueChanges.pipe(takeUntilDestroyed()).subscribe((registrados) => {
      if (this.reiniciando) return;
      this.form.patchValue({ acudienteId: '', nombreAcudiente: '', telefonoAcudiente: '', estudiantes: [] });
      this.ajustarValidaciones(registrados);
    });

    effect(() => {
      const cotizacion = this.cotizacion();
      this.reiniciando = true;
      if (cotizacion) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, numero: _n, valorTotal: _t, ...datos } = cotizacion;
        this.form.reset({ ...datos, acudienteId: datos.acudienteId ?? '' });
      } else {
        this.form.reset();
      }
      this.reiniciando = false;
      this.ajustarValidaciones(this.form.controls.registrados.value);
      if (this.soloLectura()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  protected error(campo: keyof typeof this.form.controls): string | null {
    return mensajeError(this.form.controls[campo]);
  }

  protected errorLista(): string | null {
    const control = this.form.controls.estudiantes;
    return control.invalid && control.touched ? 'Agrega al menos un estudiante a la cotización.' : null;
  }

  protected agregar(): void {
    const actuales = this.form.controls.estudiantes.value;
    let nuevo: EstudianteCotizado;
    if (this.registrados()) {
      const opcion = this.estudiantesAcudiente().find((o) => o.id === this.estudianteElegido());
      if (!opcion) {
        this.errorAgregar.set('Elige un estudiante del acudiente.');
        return;
      }
      nuevo = { estudianteId: opcion.id, nombre: opcion.nombre };
    } else {
      const nombre = this.nombreNuevo().trim().replace(/\s+/g, ' ');
      if (nombre.length < 3) {
        this.errorAgregar.set('Escribe el nombre del estudiante.');
        return;
      }
      if (actuales.some((e) => e.nombre.toLowerCase() === nombre.toLowerCase())) {
        this.errorAgregar.set('Ese estudiante ya está en la cotización.');
        return;
      }
      nuevo = { estudianteId: null, nombre };
    }
    this.errorAgregar.set(null);
    this.form.controls.estudiantes.setValue([...actuales, nuevo]);
    this.form.controls.estudiantes.markAsTouched();
    this.estudianteElegido.set('');
    this.nombreNuevo.set('');
  }

  protected quitar(indice: number): void {
    this.form.controls.estudiantes.setValue(this.form.controls.estudiantes.value.filter((_, i) => i !== indice));
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const nombreAcudiente = v.registrados
      ? (this.acudientes().find((a) => a.id === v.acudienteId)?.nombre ?? v.nombreAcudiente)
      : v.nombreAcudiente.trim();
    const valorPorEstudiante = v.valorPorEstudiante ?? 0;
    this.guardar.emit({
      ...v,
      numero: this.cotizacion()?.numero ?? '',
      acudienteId: v.registrados ? v.acudienteId : null,
      nombreAcudiente,
      telefonoAcudiente: v.telefonoAcudiente.trim(),
      valorPorEstudiante,
      valorTotal: calcularTotal(valorPorEstudiante, v.estudiantes.length),
      observaciones: v.observaciones.trim(),
    });
  }

  private ajustarValidaciones(registrados: boolean): void {
    const { acudienteId, nombreAcudiente } = this.form.controls;
    acudienteId.setValidators(registrados ? Validators.required : null);
    nombreAcudiente.setValidators(registrados ? null : [Validators.required, Validators.maxLength(100)]);
    acudienteId.updateValueAndValidity({ emitEvent: false });
    nombreAcudiente.updateValueAndValidity({ emitEvent: false });
  }
}
