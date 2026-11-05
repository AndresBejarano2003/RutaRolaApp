import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campo, TituloSeccion } from 'src/app/shared/campo/campo';
import { DatosRegistro, ESTADOS_REGISTRO, EstadoRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { mensajeError, nit, telefono } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { Colegio, Curso } from '../colegio';
import { CursosColegio } from '../cursos-colegio/cursos-colegio';

/** Campos del colegio y parametrización de sus cursos. Botones en el pie del modal. */
@Component({
  selector: 'app-colegio-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, Campo, TituloSeccion, CursosColegio],
  templateUrl: './colegio-formulario.html',
})
export class ColegioFormulario {
  readonly idFormulario = input.required<string>();
  readonly colegio = input<Colegio | null>(null);
  readonly modo = input.required<ModoFormulario>();
  readonly guardar = output<DatosRegistro<Colegio>>();

  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    nit: ['', [Validators.required, nit]],
    razonSocial: ['', [Validators.required, Validators.maxLength(120)]],
    direccion: ['', [Validators.required, Validators.maxLength(120)]],
    telefono: ['', telefono],
    cursos: this.fb.control<Curso[]>([]),
    estado: this.fb.control<EstadoRegistro>('ACTIVO', Validators.required),
  });

  constructor() {
    effect(() => {
      const colegio = this.colegio();
      if (colegio) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, ...datos } = colegio;
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
      nit: valores.nit.replace(/[\s.]/g, ''),
      razonSocial: valores.razonSocial.trim(),
      direccion: valores.direccion.trim(),
      telefono: valores.telefono.trim(),
    });
  }
}
