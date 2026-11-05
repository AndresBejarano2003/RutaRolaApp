import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Encabezado de la tarjeta del listado: título, descripción, indicador de
 * carga, "Modo local", total de registros y el botón principal (crear).
 * Debajo muestra el error de carga con "Reintentar".
 * Contenido adicional (otros botones) se proyecta antes del botón principal.
 */
@Component({
  selector: 'app-encabezado-listado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 class="card-title text-base-content text-xl">
          {{ titulo() }}
          @if (cargando()) {
            <span class="loading loading-spinner loading-sm text-base-content/70"></span>
          }
        </h2>
        @if (descripcion()) {
          <p class="text-base-content/70 text-sm">{{ descripcion() }}</p>
        }
      </div>

      <div class="flex flex-wrap items-center gap-2">
        @if (modoLocal()) {
          <div class="tooltip tooltip-bottom" data-tip="Los datos se guardan en este navegador hasta conectar el API">
            <span class="badge badge-warning badge-soft gap-1">
              <i class="fa-solid fa-database text-xs"></i>
              Modo local
            </span>
          </div>
        }
        <span class="badge badge-primary">{{ total() }} {{ total() === 1 ? 'registro' : 'registros' }}</span>
        <ng-content />
        @if (textoNuevo()) {
          <button type="button" class="btn btn-primary" (click)="nuevo.emit()">
            <i class="fa-solid fa-plus"></i>
            {{ textoNuevo() }}
          </button>
        }
      </div>
    </div>
    <div class="divider my-2"></div>

    @if (error(); as mensaje) {
      <div role="alert" class="alert alert-error mb-4">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ mensaje }}</span>
        <button type="button" class="btn btn-sm" (click)="reintentar.emit()">Reintentar</button>
      </div>
    }
  `,
})
export class EncabezadoListado {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly cargando = input(false);
  readonly total = input(0);
  readonly modoLocal = input(false);
  /** Texto del botón principal; vacío = sin botón (pantallas de solo lectura). */
  readonly textoNuevo = input('');
  /** Error al cargar el listado (muestra la alerta con "Reintentar"). */
  readonly error = input<string | null>(null);
  readonly nuevo = output<void>();
  readonly reintentar = output<void>();
}
