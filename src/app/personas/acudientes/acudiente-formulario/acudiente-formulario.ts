import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosRegistro, ESTADOS_REGISTRO, EstadoRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { mensajeError, telefono } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { CamposPersona } from '../../compartido/campos-persona/campos-persona';
import { controlesPersona, limpiarPersona } from '../../compartido/persona';
import { Acudiente } from '../acudiente';

/**
 * Campos para crear, editar o consultar (solo lectura) un acudiente.
 * Los botones van en el pie fijo del modal (`app-acciones-formulario`).
 */
@Component({
  selector: 'app-acudiente-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, CamposPersona],
  templateUrl: './acudiente-formulario.html',
})
export class AcudienteFormulario {
  readonly idFormulario = input.required<string>();
  readonly acudiente = input<Acudiente | null>(null);
  readonly modo = input.required<ModoFormulario>();

  readonly guardar = output<DatosRegistro<Acudiente>>();

  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    ...controlesPersona(this.fb),
    telefono: ['', [Validators.required, telefono]],
    telefonoAlterno: ['', telefono],
    correo: ['', [Validators.email, Validators.maxLength(100)]],
    direccion: ['', Validators.maxLength(120)],
    estado: this.fb.control<EstadoRegistro>('ACTIVO', Validators.required),
  });

  constructor() {
    effect(() => {
      const acudiente = this.acudiente();
      if (acudiente) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, ...datos } = acudiente;
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
      telefono: valores.telefono.trim(),
      telefonoAlterno: valores.telefonoAlterno.trim(),
      correo: valores.correo.trim().toLowerCase(),
      direccion: valores.direccion.trim(),
    });
  }
}
