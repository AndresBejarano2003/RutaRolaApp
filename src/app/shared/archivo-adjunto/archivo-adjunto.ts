import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Archivo guardado con el registro. Mientras no haya API, `url` es un
 * data URL (base64); con el API será la URL del archivo en el servidor.
 */
export interface ArchivoAdjunto {
  nombre: string;
  tipo: string;
  /** Bytes */
  tamano: number;
  url: string;
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Valida tipo y tamaño y lee el archivo como data URL. Rechaza con un mensaje para el usuario. */
export function leerArchivo(archivo: File, aceptar: string, tamanoMaximoMb: number): Promise<ArchivoAdjunto> {
  if (!tipoPermitido(archivo, aceptar)) {
    return Promise.reject(new Error('Tipo de archivo no permitido.'));
  }
  if (archivo.size > tamanoMaximoMb * 1024 * 1024) {
    return Promise.reject(
      new Error(`El archivo pesa ${formatearTamano(archivo.size)}; el máximo es ${tamanoMaximoMb} MB.`),
    );
  }
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () =>
      resolver({ nombre: archivo.name, tipo: archivo.type, tamano: archivo.size, url: lector.result as string });
    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo.'));
    lector.readAsDataURL(archivo);
  });
}

function tipoPermitido(archivo: File, aceptar: string): boolean {
  return aceptar
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .some((t) =>
      t.startsWith('.')
        ? archivo.name.toLowerCase().endsWith(t)
        : t.endsWith('/*')
          ? archivo.type.startsWith(t.slice(0, -1))
          : archivo.type === t,
    );
}

/** Texto de ayuda de tipos y tamaño, p. ej. "PDF, IMAGEN · máximo 2 MB". */
function textoAyuda(aceptar: string, tamanoMaximoMb: number): string {
  const tipos = aceptar.replace('image/*', 'imagen').replaceAll('.', '').toUpperCase().replaceAll(',', ', ');
  return `${tipos} · máximo ${tamanoMaximoMb} MB`;
}

/**
 * Campo para adjuntar UN archivo (contratos, soportes...). Valida tipo y
 * tamaño, permite ver/descargar, reemplazar y quitar. Funciona con
 * `formControlName`; deshabilitado (modo consulta) solo permite ver.
 *
 * ```html
 * <app-archivo-adjunto formControlName="contrato" aceptar=".pdf,image/*" [tamanoMaximoMb]="2" />
 * ```
 */
@Component({
  selector: 'app-archivo-adjunto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ArchivoAdjuntoCampo), multi: true }],
  template: `
    <input #selector type="file" class="hidden" [accept]="aceptar()" (change)="alSeleccionar(selector)" />

    @if (archivo(); as actual) {
      <div class="flex items-center gap-3 rounded-box border border-neutral bg-base-100 px-3 py-2">
        <i class="text-2xl text-info" [class]="actual.tipo === 'application/pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'"></i>
        <div class="min-w-0 flex-1">
          <div class="truncate font-medium">{{ actual.nombre }}</div>
          <div class="text-xs text-base-content/70">{{ tamanoTexto() }}</div>
        </div>
        <a class="btn btn-ghost btn-sm btn-square text-info" [href]="actual.url" [attr.download]="actual.nombre"
          target="_blank" aria-label="Ver o descargar archivo">
          <i class="fa-solid fa-download"></i>
        </a>
        @if (!deshabilitado()) {
          <button type="button" class="btn btn-ghost btn-sm btn-square text-primary" aria-label="Reemplazar archivo"
            (click)="selector.click()">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
          <button type="button" class="btn btn-ghost btn-sm btn-square text-error" aria-label="Quitar archivo"
            (click)="quitar()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        }
      </div>
    } @else if (deshabilitado()) {
      <p class="text-sm text-base-content/70 py-2">Sin archivo adjunto.</p>
    } @else {
      <button type="button"
        class="w-full rounded-box border-2 border-dashed border-neutral hover:border-primary bg-base-100 px-4 py-4 text-center transition-colors"
        [class.border-error]="invalido() || error()" (click)="selector.click()">
        <i class="fa-solid fa-paperclip text-primary"></i>
        <span class="ml-2 font-medium">Adjuntar archivo</span>
        <span class="block text-xs text-base-content/70 mt-1">{{ ayuda() }}</span>
      </button>
    }

    @if (error(); as mensaje) {
      <span class="block text-xs text-error mt-1">{{ mensaje }}</span>
    }
  `,
})
export class ArchivoAdjuntoCampo implements ControlValueAccessor {
  /** Valor del atributo `accept` del input de archivo. */
  readonly aceptar = input('.pdf,image/*');
  readonly tamanoMaximoMb = input(2);
  readonly invalido = input(false);

  protected readonly archivo = signal<ArchivoAdjunto | null>(null);
  protected readonly deshabilitado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly tamanoTexto = computed(() => formatearTamano(this.archivo()?.tamano ?? 0));
  protected readonly ayuda = computed(() => textoAyuda(this.aceptar(), this.tamanoMaximoMb()));

  private alCambiar: (valor: ArchivoAdjunto | null) => void = () => {};
  private alTocar: () => void = () => {};

  writeValue(valor: ArchivoAdjunto | null): void {
    this.archivo.set(valor ?? null);
    this.error.set(null);
  }
  registerOnChange(fn: (valor: ArchivoAdjunto | null) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  protected async alSeleccionar(selector: HTMLInputElement): Promise<void> {
    const archivo = selector.files?.[0];
    selector.value = ''; // permite volver a elegir el mismo archivo
    this.alTocar();
    if (!archivo) {
      return;
    }
    try {
      const adjunto = await leerArchivo(archivo, this.aceptar(), this.tamanoMaximoMb());
      this.error.set(null);
      this.archivo.set(adjunto);
      this.alCambiar(adjunto);
    } catch (error) {
      this.error.set((error as Error).message);
    }
  }

  protected quitar(): void {
    this.archivo.set(null);
    this.alCambiar(null);
    this.alTocar();
  }
}

/**
 * Campo para adjuntar VARIOS archivos (p. ej. adjuntos de un correo).
 * Valor: `ArchivoAdjunto[]`. Funciona con `formControlName`.
 */
@Component({
  selector: 'app-archivos-adjuntos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ArchivosAdjuntosCampo), multi: true }],
  template: `
    <input #selector type="file" class="hidden" multiple [accept]="aceptar()" (change)="alSeleccionar(selector)" />
    @if (archivos().length) {
      <ul class="space-y-2 mb-2">
        @for (archivo of archivos(); track $index) {
          <li class="flex items-center gap-3 rounded-box border border-neutral bg-base-100 px-3 py-2">
            <i class="text-xl text-info" [class]="archivo.tipo === 'application/pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file'"></i>
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium">{{ archivo.nombre }}</div>
              <div class="text-xs text-base-content/70">{{ tamano(archivo.tamano) }}</div>
            </div>
            <a class="btn btn-ghost btn-sm btn-square text-info" [href]="archivo.url" [attr.download]="archivo.nombre"
              target="_blank" aria-label="Ver o descargar archivo">
              <i class="fa-solid fa-download"></i>
            </a>
            @if (!deshabilitado()) {
              <button type="button" class="btn btn-ghost btn-sm btn-square text-error" aria-label="Quitar archivo"
                (click)="quitar($index)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }
          </li>
        }
      </ul>
    } @else if (deshabilitado()) {
      <p class="text-sm text-base-content/70 py-2">Sin archivos adjuntos.</p>
    }
    @if (!deshabilitado() && archivos().length < maximo()) {
      <button type="button" class="btn btn-sm bg-base-300 border-neutral hover:bg-neutral" (click)="selector.click()">
        <i class="fa-solid fa-paperclip"></i>
        Agregar adjunto
        <span class="text-xs text-base-content/70 font-normal">({{ ayuda() }})</span>
      </button>
    }
    @if (error(); as mensaje) {
      <span class="block text-xs text-error mt-1">{{ mensaje }}</span>
    }
  `,
})
export class ArchivosAdjuntosCampo implements ControlValueAccessor {
  readonly aceptar = input('.pdf,image/*');
  /** Tamaño máximo POR archivo. */
  readonly tamanoMaximoMb = input(1);
  readonly maximo = input(3);

  protected readonly archivos = signal<ArchivoAdjunto[]>([]);
  protected readonly deshabilitado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ayuda = computed(() => `${textoAyuda(this.aceptar(), this.tamanoMaximoMb())} c/u`);
  protected readonly tamano = formatearTamano;

  private alCambiar: (valor: ArchivoAdjunto[]) => void = () => {};
  private alTocar: () => void = () => {};

  writeValue(valor: ArchivoAdjunto[] | null): void {
    this.archivos.set(valor ?? []);
    this.error.set(null);
  }
  registerOnChange(fn: (valor: ArchivoAdjunto[]) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  protected async alSeleccionar(selector: HTMLInputElement): Promise<void> {
    const elegidos = [...(selector.files ?? [])].slice(0, this.maximo() - this.archivos().length);
    selector.value = '';
    this.alTocar();
    try {
      const leidos = await Promise.all(elegidos.map((a) => leerArchivo(a, this.aceptar(), this.tamanoMaximoMb())));
      this.error.set(null);
      this.archivos.update((actuales) => [...actuales, ...leidos]);
      this.alCambiar(this.archivos());
    } catch (error) {
      this.error.set((error as Error).message);
    }
  }

  protected quitar(indice: number): void {
    this.archivos.update((actuales) => actuales.filter((_, i) => i !== indice));
    this.alCambiar(this.archivos());
    this.alTocar();
  }
}
