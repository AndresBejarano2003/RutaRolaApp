import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BadgeEstado } from 'src/app/shared/badge-estado/badge-estado';
import { GRADOS, aMapa } from 'src/app/shared/catalogos/catalogos';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { horaLegible } from 'src/app/shared/fechas/fechas';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { Curso, generarCursos, ordenarCursos } from '../colegio';

/**
 * Parametrización de cursos de un colegio (valor: `Curso[]`).
 *
 * "Agregar cursos" llena la tabla desde Jardín hasta el curso elegido con
 * el horario indicado. Cada curso se puede modificar (horario y estado) o
 * quitar. Deshabilitado (consulta) solo muestra la tabla.
 */
@Component({
  selector: 'app-cursos-colegio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, BadgeEstado],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CursosColegio), multi: true }],
  host: { class: 'block md:col-span-2' },
  templateUrl: './cursos-colegio.html',
})
export class CursosColegio implements ControlValueAccessor {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly grados = GRADOS;
  protected readonly nombresGrado = aMapa(GRADOS);
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly horaLegible = horaLegible;

  protected readonly cursos = signal<Curso[]>([]);
  protected readonly deshabilitado = signal(false);
  /** Grado del curso que se está modificando. */
  protected readonly editando = signal<string | null>(null);
  protected readonly errorGenerador = signal<string | null>(null);
  protected readonly errorEdicion = signal<string | null>(null);
  protected readonly activos = computed(() => this.cursos().filter((c) => c.estado === 'ACTIVO').length);

  protected readonly generador = this.fb.group({
    hasta: ['', Validators.required],
    horaEntrada: ['06:30', Validators.required],
    horaSalida: ['13:00', Validators.required],
  });

  protected readonly edicion = this.fb.group({
    horaEntrada: ['', Validators.required],
    horaSalida: ['', Validators.required],
    estado: this.fb.control<EstadoRegistro>('ACTIVO'),
  });

  private alCambiar: (valor: Curso[]) => void = () => {};
  private alTocar: () => void = () => {};

  writeValue(valor: Curso[] | null): void {
    this.cursos.set(ordenarCursos(valor ?? []));
    this.editando.set(null);
  }
  registerOnChange(fn: (valor: Curso[]) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
    this.editando.set(null);
  }

  protected agregarCursos(): void {
    const { hasta, horaEntrada, horaSalida } = this.generador.getRawValue();
    if (!hasta || !horaEntrada || !horaSalida) {
      this.generador.markAllAsTouched();
      this.errorGenerador.set('Elige el curso final y el horario.');
      return;
    }
    if (horaSalida <= horaEntrada) {
      this.errorGenerador.set('La hora de salida debe ser posterior a la de entrada.');
      return;
    }
    this.errorGenerador.set(null);
    this.actualizar(generarCursos(this.cursos(), hasta, horaEntrada, horaSalida));
  }

  protected modificar(curso: Curso): void {
    this.errorEdicion.set(null);
    this.edicion.reset({ horaEntrada: curso.horaEntrada, horaSalida: curso.horaSalida, estado: curso.estado });
    this.editando.set(curso.grado);
  }

  protected guardarEdicion(): void {
    const { horaEntrada, horaSalida, estado } = this.edicion.getRawValue();
    if (!horaEntrada || !horaSalida || horaSalida <= horaEntrada) {
      this.errorEdicion.set('La hora de salida debe ser posterior a la de entrada.');
      return;
    }
    const grado = this.editando();
    this.actualizar(this.cursos().map((c) => (c.grado === grado ? { ...c, horaEntrada, horaSalida, estado } : c)));
    this.editando.set(null);
  }

  protected quitar(curso: Curso): void {
    this.actualizar(this.cursos().filter((c) => c.grado !== curso.grado));
  }

  private actualizar(cursos: Curso[]): void {
    this.cursos.set(cursos);
    this.alCambiar(cursos);
    this.alTocar();
  }
}
