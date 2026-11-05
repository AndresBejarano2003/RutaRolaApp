import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArchivoAdjunto, ArchivosAdjuntosCampo } from 'src/app/shared/archivo-adjunto/archivo-adjunto';
import { mensajeError } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { CanalEnvio, ESTADOS_PLANTILLA, EstadoPlantilla, PlantillaMensaje, VARIABLES_MENSAJE, aplicarVariables } from '../programacion';

/** Tamaño máximo de cada adjunto adicional del correo mientras se guarda en el navegador. */
export const TAMANO_MAXIMO_ADJUNTO_MB = 1;

/**
 * Mensajes predefinidos de un canal (valor: `PlantillaMensaje[]`):
 * listado + registro/edición. Regla: solo UNO puede estar "En uso" (es el
 * que se envía); al marcar otro, el anterior pasa a "Activo".
 */
@Component({
  selector: 'app-plantillas-mensaje',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, ArchivosAdjuntosCampo],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PlantillasMensaje), multi: true }],
  host: { class: 'block' },
  templateUrl: './plantillas-mensaje.html',
})
export class PlantillasMensaje implements ControlValueAccessor {
  readonly canal = input.required<CanalEnvio>();

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly estados = ESTADOS_PLANTILLA;
  protected readonly variables = VARIABLES_MENSAJE;
  protected readonly tamanoMaximoAdjunto = TAMANO_MAXIMO_ADJUNTO_MB;

  protected readonly plantillas = signal<PlantillaMensaje[]>([]);
  protected readonly deshabilitado = signal(false);
  /** `null` = editor cerrado; `''` = nueva; id = editando. */
  protected readonly editando = signal<string | null>(null);
  protected readonly esCorreo = computed(() => this.canal() === 'EMAIL');
  protected readonly nombre = computed(() => (this.esCorreo() ? 'correo' : 'mensaje'));

  protected readonly editor = this.fb.group({
    asunto: ['', Validators.maxLength(150)],
    cuerpo: ['', [Validators.required, Validators.maxLength(1000)]],
    adjuntos: this.fb.control<ArchivoAdjunto[]>([]),
    estado: this.fb.control<EstadoPlantilla>('ACTIVO', Validators.required),
  });
  protected readonly vistaPrevia = signal('');

  private alCambiar: (valor: PlantillaMensaje[]) => void = () => {};
  private alTocar: () => void = () => {};

  constructor() {
    this.editor.controls.cuerpo.valueChanges.pipe(takeUntilDestroyed()).subscribe((texto) => this.vistaPrevia.set(aplicarVariables(texto)));
  }

  writeValue(valor: PlantillaMensaje[] | null): void {
    this.plantillas.set(valor ?? []);
    this.editando.set(null);
  }
  registerOnChange(fn: (valor: PlantillaMensaje[]) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
    this.editando.set(null);
  }

  protected nueva(): void {
    this.editor.reset({ asunto: '', cuerpo: '', adjuntos: [], estado: this.plantillas().length ? 'ACTIVO' : 'EN_USO' });
    this.ajustarAsunto();
    this.editando.set('');
  }

  protected modificar(p: PlantillaMensaje): void {
    this.editor.reset({ asunto: p.asunto, cuerpo: p.cuerpo, adjuntos: p.adjuntos, estado: p.estado });
    this.ajustarAsunto();
    this.editando.set(p.id);
  }

  protected insertarVariable(clave: string, campo: HTMLTextAreaElement): void {
    const control = this.editor.controls.cuerpo;
    const inicio = campo.selectionStart ?? control.value.length;
    const fin = campo.selectionEnd ?? inicio;
    control.setValue(control.value.slice(0, inicio) + clave + control.value.slice(fin));
    queueMicrotask(() => {
      campo.focus();
      campo.setSelectionRange(inicio + clave.length, inicio + clave.length);
    });
  }

  protected guardarPlantilla(): void {
    if (this.editor.invalid) {
      this.editor.markAllAsTouched();
      return;
    }
    const v = this.editor.getRawValue();
    const id = this.editando() || crypto.randomUUID();
    const plantilla: PlantillaMensaje = {
      id,
      asunto: this.esCorreo() ? v.asunto.trim() : '',
      cuerpo: v.cuerpo.trim(),
      adjuntos: this.esCorreo() ? v.adjuntos : [],
      estado: v.estado,
    };
    const existe = this.plantillas().some((p) => p.id === id);
    let lista = existe ? this.plantillas().map((p) => (p.id === id ? plantilla : p)) : [...this.plantillas(), plantilla];
    lista = this.unicoEnUso(lista, plantilla);
    this.actualizar(lista);
    this.editando.set(null);
  }

  /** Marca como "En uso" (el que se envía). */
  protected usar(p: PlantillaMensaje): void {
    const elegido = { ...p, estado: 'EN_USO' as const };
    this.actualizar(this.unicoEnUso(this.plantillas().map((x) => (x.id === p.id ? elegido : x)), elegido));
  }

  protected quitar(p: PlantillaMensaje): void {
    this.actualizar(this.plantillas().filter((x) => x.id !== p.id));
    if (this.editando() === p.id) this.editando.set(null);
  }

  protected error(campo: keyof typeof this.editor.controls): string | null {
    return mensajeError(this.editor.controls[campo]);
  }

  protected etiquetaEstado(estado: EstadoPlantilla): string {
    return ESTADOS_PLANTILLA.find((e) => e.id === estado)?.nombre ?? estado;
  }

  /** Regla: solo uno "En uso"; los demás que lo estuvieran pasan a "Activo". */
  private unicoEnUso(lista: PlantillaMensaje[], elegido: PlantillaMensaje): PlantillaMensaje[] {
    if (elegido.estado !== 'EN_USO') return lista;
    return lista.map((p) => (p.id !== elegido.id && p.estado === 'EN_USO' ? { ...p, estado: 'ACTIVO' } : p));
  }

  private ajustarAsunto(): void {
    const asunto = this.editor.controls.asunto;
    asunto.setValidators(this.esCorreo() ? [Validators.required, Validators.maxLength(150)] : null);
    asunto.updateValueAndValidity({ emitEvent: false });
    this.vistaPrevia.set(aplicarVariables(this.editor.controls.cuerpo.value));
  }

  private actualizar(lista: PlantillaMensaje[]): void {
    this.plantillas.set(lista);
    this.alCambiar(lista);
    this.alTocar();
  }
}
