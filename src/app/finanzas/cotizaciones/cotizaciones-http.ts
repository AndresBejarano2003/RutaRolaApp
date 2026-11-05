import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { Cotizacion, FiltrosCotizacion } from './cotizacion';
import { CotizacionesRepositorio } from './cotizaciones-repositorio';

/**
 * Conexión al API: `{apiUrl}/cotizaciones` (filtros `texto`, `estado`,
 * `desde`, `hasta`). El API genera `numero` y recalcula `valorTotal`.
 */
@Injectable()
export class CotizacionesHttp extends RepositorioHttp<Cotizacion, FiltrosCotizacion> implements CotizacionesRepositorio {
  protected readonly recurso = 'cotizaciones';
}
