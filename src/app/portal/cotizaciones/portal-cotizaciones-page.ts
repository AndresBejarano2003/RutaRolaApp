import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ESTADOS_COTIZACION, EstadoCotizacion } from 'src/app/finanzas/cotizaciones/cotizacion';
import { fechaCorta } from 'src/app/shared/fechas/fechas';
import { PortalEstado } from '../portal-estado';

/** Cotizaciones que la empresa le ha hecho al acudiente (solo consulta). */
@Component({
  selector: 'app-portal-cotizaciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './portal-cotizaciones-page.html',
})
export default class PortalCotizacionesPage {
  protected readonly estado = inject(PortalEstado);
  protected readonly datos = this.estado.datos;
  protected readonly fechaCorta = fechaCorta;

  protected estadoDe(id: EstadoCotizacion) {
    return ESTADOS_COTIZACION.find((e) => e.id === id) ?? ESTADOS_COTIZACION[0];
  }
}
