import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { ArchivoAdjunto, ArchivoAdjuntoCampo } from 'src/app/shared/archivo-adjunto/archivo-adjunto';
import { CatalogosService } from 'src/app/shared/catalogos/catalogos';
import { DatosRegistro, ESTADOS_REGISTRO, EstadoRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { fechaNoFutura, mensajeError, telefono } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { CamposPersona } from '../../compartido/campos-persona/campos-persona';
import { controlesPersona, limpiarPersona } from '../../compartido/persona';
import {
  CATEGORIAS_LICENCIA,
  DIAS_ALERTA_LICENCIA,
  Empleado,
  LONGITUD_MINIMA_CONTRASENA,
  PATRON_USUARIO,
  TIPOS_CONTRATO,
  TIPOS_EMPLEADO,
  TipoContrato,
  TipoEmpleado,
  estadoLicencia,
} from '../empleado';

/** "Confirmar contraseña" debe coincidir con la contraseña. */
function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
  const contrasena = grupo.get('contrasena');
  const confirmar = grupo.get('confirmarContrasena');
  if (!contrasena || !confirmar) return null;
  const distintas = !!contrasena.value && contrasena.value !== confirmar.value;
  const errores = { ...confirmar.errors };
  delete errores['noCoincide'];
  confirmar.setErrors(distintas ? { ...errores, noCoincide: true } : Object.keys(errores).length ? errores : null);
  return null;
}

/** Los empleados son mayores de edad: sin registro civil ni tarjeta de identidad. */
const DOCUMENTOS_ADULTO = ['CC', 'CE', 'PPT', 'PA'];

/** Tamaño máximo del contrato adjunto mientras se guarda en el navegador. */
export const TAMANO_MAXIMO_CONTRATO_MB = 2;

/**
 * Campos para crear, editar o consultar (solo lectura) un empleado.
 * La licencia de conducción solo se pide (y es obligatoria) para conductores.
 * Los botones van en el pie fijo del modal (`app-acciones-formulario`).
 */
@Component({
  selector: 'app-empleado-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, CamposPersona, ArchivoAdjuntoCampo, CurrencyPipe],
  templateUrl: './empleado-formulario.html',
})
export class EmpleadoFormulario {
  readonly idFormulario = input.required<string>();
  readonly empleado = input<Empleado | null>(null);
  readonly modo = input.required<ModoFormulario>();

  readonly guardar = output<DatosRegistro<Empleado>>();

  protected readonly tiposDocumento = inject(CatalogosService).tiposDocumento.filter((t) =>
    DOCUMENTOS_ADULTO.includes(t.id),
  );
  protected readonly tipos = TIPOS_EMPLEADO;
  protected readonly contratos = TIPOS_CONTRATO;
  protected readonly categorias = CATEGORIAS_LICENCIA;
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly diasAlerta = DIAS_ALERTA_LICENCIA;
  protected readonly tamanoMaximoContrato = TAMANO_MAXIMO_CONTRATO_MB;
  protected readonly hoy = new Date().toISOString().slice(0, 10);
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    ...controlesPersona(this.fb),
    tipoEmpleado: this.fb.control<TipoEmpleado | ''>('', Validators.required),
    fechaIngreso: ['', [Validators.required, fechaNoFutura]],
    tipoContrato: this.fb.control<TipoContrato | ''>('', Validators.required),
    sueldo: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    contrato: this.fb.control<ArchivoAdjunto | null>(null),
    numeroLicencia: [''],
    categoriaLicencia: [''],
    vencimientoLicencia: [''],
    telefono: ['', [Validators.required, telefono]],
    correo: ['', [Validators.email, Validators.maxLength(100)]],
    direccion: ['', Validators.maxLength(120)],
    usuario: ['', [Validators.required, Validators.pattern(PATRON_USUARIO)]],
    contrasena: [''],
    confirmarContrasena: [''],
    estado: this.fb.control<EstadoRegistro>('ACTIVO', Validators.required),
  }, { validators: contrasenasIguales });

  protected readonly minimoContrasena = LONGITUD_MINIMA_CONTRASENA;
  protected readonly mostrarContrasena = signal(false);

  protected readonly tipoSeleccionado = toSignal(
    this.form.controls.tipoEmpleado.valueChanges.pipe(startWith(this.form.controls.tipoEmpleado.value)),
    { requireSync: true },
  );
  private readonly vencimiento = toSignal(this.form.controls.vencimientoLicencia.valueChanges, { initialValue: '' });
  protected readonly alertaLicencia = computed(() => estadoLicencia(this.vencimiento()));

  constructor() {
    // Licencia obligatoria solo para conductores.
    this.form.controls.tipoEmpleado.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((tipo) => this.ajustarLicencia(tipo === 'CONDUCTOR'));

    effect(() => {
      const empleado = this.empleado();
      if (empleado) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, ...datos } = empleado;
        this.form.reset({ ...datos, usuario: datos.usuario ?? '', contrasena: '', confirmarContrasena: '' });
      } else {
        this.form.reset();
      }
      // Contraseña obligatoria al crear; al editar, vacía = conservar la actual.
      const longitud = [Validators.minLength(LONGITUD_MINIMA_CONTRASENA), Validators.maxLength(64)];
      this.form.controls.contrasena.setValidators(this.modo() === 'crear' ? [Validators.required, ...longitud] : longitud);
      this.form.controls.contrasena.updateValueAndValidity({ emitEvent: false });
      if (this.soloLectura()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  protected error(campo: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[campo];
    if (control.hasError('noCoincide') && (control.touched || control.dirty)) return 'Las contraseñas no coinciden.';
    if (campo === 'usuario' && control.hasError('pattern') && (control.touched || control.dirty)) {
      return 'Entre 4 y 40 caracteres, sin espacios.';
    }
    return mensajeError(control);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { confirmarContrasena: _confirmar, ...valores } = limpiarPersona(this.form.getRawValue());
    this.guardar.emit({
      ...valores,
      usuario: valores.usuario.trim().toLowerCase(),
      // Validados como obligatorios: no pueden llegar vacíos.
      tipoEmpleado: valores.tipoEmpleado as TipoEmpleado,
      tipoContrato: valores.tipoContrato as TipoContrato,
      sueldo: valores.sueldo ?? 0,
      numeroLicencia: valores.numeroLicencia.trim(),
      telefono: valores.telefono.trim(),
      correo: valores.correo.trim().toLowerCase(),
      direccion: valores.direccion.trim(),
    });
  }

  private ajustarLicencia(obligatoria: boolean): void {
    const { numeroLicencia, categoriaLicencia, vencimientoLicencia } = this.form.controls;
    numeroLicencia.setValidators(obligatoria ? [Validators.required, Validators.pattern(/^\d{5,15}$/)] : null);
    categoriaLicencia.setValidators(obligatoria ? Validators.required : null);
    vencimientoLicencia.setValidators(obligatoria ? Validators.required : null);
    for (const control of [numeroLicencia, categoriaLicencia, vencimientoLicencia]) {
      if (!obligatoria) {
        control.setValue('', { emitEvent: false });
      }
      control.updateValueAndValidity({ emitEvent: false });
    }
  }
}
