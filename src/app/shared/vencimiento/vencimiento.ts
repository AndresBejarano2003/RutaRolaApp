import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Días antes del vencimiento en los que se alerta "por vencer" (licencias, SOAT, revisiones...). */
export const DIAS_ALERTA_VENCIMIENTO = 30;

export type EstadoVencimiento = 'VIGENTE' | 'POR_VENCER' | 'VENCIDA';

/** Estado de un documento según su fecha de vencimiento (`YYYY-MM-DD`). */
export function estadoVencimiento(vencimiento: string, hoy = new Date()): EstadoVencimiento | null {
  if (!vencimiento) {
    return null;
  }
  const hoyTexto = hoy.toISOString().slice(0, 10);
  if (vencimiento < hoyTexto) {
    return 'VENCIDA';
  }
  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + DIAS_ALERTA_VENCIMIENTO);
  return vencimiento <= limite.toISOString().slice(0, 10) ? 'POR_VENCER' : 'VIGENTE';
}

const GRAVEDAD: Record<EstadoVencimiento, number> = { VIGENTE: 0, POR_VENCER: 1, VENCIDA: 2 };

/** El peor estado entre varias fechas (p. ej. todos los documentos de un vehículo). */
export function peorVencimiento(fechas: string[], hoy = new Date()): EstadoVencimiento | null {
  return fechas
    .map((f) => estadoVencimiento(f, hoy))
    .reduce<EstadoVencimiento | null>(
      (peor, actual) => (actual && (!peor || GRAVEDAD[actual] > GRAVEDAD[peor]) ? actual : peor),
      null,
    );
}

/** Badge Vigente (verde) / Por vencer (amarillo) / Vencida (rojo) con la fecha. */
@Component({
  selector: 'app-badge-vencimiento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex flex-col gap-0.5' },
  template: `
    @switch (estado()) {
      @case ('VIGENTE') {
        <span class="badge badge-success badge-soft badge-sm whitespace-nowrap">{{ textoVigente() }}</span>
      }
      @case ('POR_VENCER') {
        <span class="badge badge-warning badge-soft badge-sm whitespace-nowrap">Por vencer</span>
      }
      @case ('VENCIDA') {
        <span class="badge badge-error badge-soft badge-sm whitespace-nowrap">Vencida</span>
      }
      @default {
        <span class="text-base-content/70">—</span>
      }
    }
    @if (mostrarFecha() && fecha()) {
      <span class="text-xs text-base-content/70">{{ fecha() }}</span>
    }
  `,
})
export class BadgeVencimiento {
  /** Fecha `YYYY-MM-DD`; si se pasa `estadoFijo`, se usa ese estado. */
  readonly fecha = input('');
  readonly estadoFijo = input<EstadoVencimiento | null>(null);
  readonly mostrarFecha = input(true);
  readonly textoVigente = input('Vigente');
  protected readonly estado = computed(() => this.estadoFijo() ?? estadoVencimiento(this.fecha()));
}
