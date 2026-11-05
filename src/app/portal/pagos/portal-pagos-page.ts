import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MEDIOS_PAGO, MedioPago } from 'src/app/finanzas/recibos/recibo';
import { fechaCorta, nombrePeriodo } from 'src/app/shared/fechas/fechas';
import { ESTADOS_CUOTA, FacturaPortal } from '../portal';
import { PortalEstado } from '../portal-estado';

/** Estado de cuenta: cada factura con el estado de sus mensualidades y el historial de recibos. */
@Component({
  selector: 'app-portal-pagos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './portal-pagos-page.html',
})
export default class PortalPagosPage {
  protected readonly estado = inject(PortalEstado);
  protected readonly datos = this.estado.datos;
  protected readonly estadosCuota = ESTADOS_CUOTA;
  protected readonly nombrePeriodo = nombrePeriodo;
  protected readonly fechaCorta = fechaCorta;

  protected readonly vigentes = computed(() => (this.datos()?.facturas ?? []).filter((f) => f.estado === 'ACTIVO'));
  protected readonly anuladas = computed(() => (this.datos()?.facturas ?? []).filter((f) => f.estado !== 'ACTIVO'));

  protected avance(f: FacturaPortal): number {
    return f.total ? Math.round((f.pagado / f.total) * 100) : 0;
  }

  protected cuenta(f: FacturaPortal, estado: keyof typeof ESTADOS_CUOTA): number {
    return f.cuotas.filter((c) => c.estado === estado).length;
  }

  protected medio(id: MedioPago): string {
    return MEDIOS_PAGO.find((m) => m.id === id)?.nombre ?? id;
  }
}
