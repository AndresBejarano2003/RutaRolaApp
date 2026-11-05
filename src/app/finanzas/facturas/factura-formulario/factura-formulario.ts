import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { Campo, TituloSeccion } from 'src/app/shared/campo/campo';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { DatosRegistro, EstadoRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { fechaIso, periodoDe } from 'src/app/shared/fechas/fechas';
import { mensajeError, posteriorA } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { ESTADOS_FACTURA, Factura, mesesFactura } from '../factura';

/** Factura de contratación: acudiente, uno de sus estudiantes y el valor mensual contratado. */
@Component({
  selector: 'app-factura-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, Campo, TituloSeccion, CurrencyPipe],
  templateUrl: './factura-formulario.html',
})
export class FacturaFormulario {
  readonly idFormulario = input.required<string>();
  readonly factura = input<Factura | null>(null);
  readonly modo = input.required<ModoFormulario>();
  readonly acudientes = input<OpcionCatalogo[]>([]);
  /** Estudiantes del acudiente elegido. */
  readonly estudiantesAcudiente = input<OpcionCatalogo[]>([]);

  readonly guardar = output<DatosRegistro<Factura>>();
  readonly acudienteCambiado = output<string>();

  protected readonly estados = ESTADOS_FACTURA;
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group(
    {
      acudienteId: ['', Validators.required],
      estudianteId: ['', Validators.required],
      valorContratacion: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      periodoInicio: [periodoDe(), Validators.required],
      periodoFin: ['', Validators.required],
      fechaEmision: [fechaIso(), Validators.required],
      concepto: ['Transporte escolar', [Validators.required, Validators.maxLength(120)]],
      estado: this.fb.control<EstadoRegistro>('ACTIVO', Validators.required),
      observaciones: ['', Validators.maxLength(500)],
    },
    { validators: posteriorA('periodoInicio', 'periodoFin', 'rangoMeses', true) },
  );

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly meses = computed(() => {
    const { periodoInicio = '', periodoFin = '' } = this.valores();
    return mesesFactura({ periodoInicio, periodoFin }).length;
  });
  protected readonly total = computed(() => this.meses() * (this.valores().valorContratacion ?? 0));

  private reiniciando = false;

  constructor() {
    this.form.controls.acudienteId.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe((id) => {
      if (!this.reiniciando) this.form.controls.estudianteId.setValue('');
      this.acudienteCambiado.emit(id);
    });

    effect(() => {
      const factura = this.factura();
      this.reiniciando = true;
      if (factura) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, numero: _n, nombreAcudiente: _na, nombreEstudiante: _ne, ...datos } =
          factura;
        this.form.reset(datos);
      } else {
        this.form.reset();
      }
      this.reiniciando = false;
      if (this.soloLectura()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  protected error(campo: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[campo];
    if (control.errors?.['rangoMeses'] && control.touched) return 'Debe ser igual o posterior al mes inicial.';
    return mensajeError(control);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const actual = this.factura();
    this.guardar.emit({
      ...v,
      numero: actual?.numero ?? '',
      nombreAcudiente: this.acudientes().find((a) => a.id === v.acudienteId)?.nombre ?? actual?.nombreAcudiente ?? '',
      nombreEstudiante: this.estudiantesAcudiente().find((e) => e.id === v.estudianteId)?.nombre ?? actual?.nombreEstudiante ?? '',
      valorContratacion: v.valorContratacion ?? 0,
      concepto: v.concepto.trim(),
      observaciones: v.observaciones.trim(),
    });
  }
}
