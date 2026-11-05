import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { Campo, TituloSeccion } from 'src/app/shared/campo/campo';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { DatosRegistro, EstadoRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { fechaIso, nombrePeriodo } from 'src/app/shared/fechas/fechas';
import { fechaNoFutura, mensajeError } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { Factura, mesesFactura } from '../../facturas/factura';
import { ESTADOS_RECIBO, MEDIOS_PAGO, MedioPago, Recibo } from '../recibo';

/**
 * Registro del pago de una mensualidad. Al elegir la factura, la página
 * entrega sus datos y los meses ya pagados: solo se ofrecen los pendientes
 * y el valor se sugiere con el valor mensual de la factura.
 */
@Component({
  selector: 'app-recibo-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, Campo, TituloSeccion, CurrencyPipe],
  templateUrl: './recibo-formulario.html',
})
export class ReciboFormulario {
  readonly idFormulario = input.required<string>();
  readonly recibo = input<Recibo | null>(null);
  readonly modo = input.required<ModoFormulario>();
  readonly facturas = input<OpcionCatalogo[]>([]);
  /** Factura elegida (completa) y los meses que ya tienen recibo válido. */
  readonly factura = input<Factura | null>(null);
  readonly periodosPagados = input<string[]>([]);

  readonly guardar = output<DatosRegistro<Recibo>>();
  readonly facturaCambiada = output<string>();

  protected readonly medios = MEDIOS_PAGO;
  protected readonly estados = ESTADOS_RECIBO;
  protected readonly hoy = fechaIso();
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    facturaId: ['', Validators.required],
    periodo: ['', Validators.required],
    fechaPago: [fechaIso(), [Validators.required, fechaNoFutura]],
    valor: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    medioPago: this.fb.control<MedioPago | ''>('', Validators.required),
    referencia: ['', Validators.maxLength(40)],
    estado: this.fb.control<EstadoRegistro>('ACTIVO', Validators.required),
    observaciones: ['', Validators.maxLength(300)],
  });

  /** Meses de la factura; los pagados (salvo el de este recibo) no se ofrecen. */
  protected readonly periodos = computed<OpcionCatalogo[]>(() => {
    const factura = this.factura();
    if (!factura) return [];
    const propio = this.recibo()?.facturaId === factura.id ? this.recibo()?.periodo : undefined;
    const pagados = new Set(this.periodosPagados().filter((p) => p !== propio));
    return mesesFactura(factura)
      .filter((p) => !pagados.has(p))
      .map((p) => ({ id: p, nombre: nombrePeriodo(p, true) }));
  });
  protected readonly pagados = computed(() => this.periodosPagados().length);

  private reiniciando = false;

  constructor() {
    this.form.controls.facturaId.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe((id) => {
      if (!this.reiniciando) this.form.patchValue({ periodo: '', valor: null });
      this.facturaCambiada.emit(id);
    });

    // Al llegar la factura elegida, se sugiere su valor mensual.
    effect(() => {
      const factura = this.factura();
      const valor = this.form.controls.valor;
      if (factura && valor.value === null && this.modo() === 'crear') {
        valor.setValue(factura.valorContratacion);
      }
    });

    effect(() => {
      const recibo = this.recibo();
      this.reiniciando = true;
      if (recibo) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, numero: _n, numeroFactura: _f, nombreAcudiente: _na, nombreEstudiante: _ne, ...datos } =
          recibo;
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
    return mensajeError(this.form.controls[campo]);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const factura = this.factura();
    const actual = this.recibo();
    this.guardar.emit({
      ...v,
      numero: actual?.numero ?? '',
      numeroFactura: factura?.numero ?? actual?.numeroFactura ?? '',
      nombreAcudiente: factura?.nombreAcudiente ?? actual?.nombreAcudiente ?? '',
      nombreEstudiante: factura?.nombreEstudiante ?? actual?.nombreEstudiante ?? '',
      valor: v.valor ?? 0,
      medioPago: v.medioPago as MedioPago,
      referencia: v.referencia.trim(),
      observaciones: v.observaciones.trim(),
    });
  }
}
