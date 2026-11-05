import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { FiltrosRecibo, Recibo } from './recibo';
import { RecibosRepositorio } from './recibos-repositorio';

/**
 * Conexión al API: `{apiUrl}/recibos` (filtros `texto`, `facturaId`,
 * `medioPago`, `estado`, `desde`, `hasta`). El API genera `numero` y valida:
 * la factura está vigente, el periodo está dentro de la factura y no hay otro
 * recibo válido del mismo periodo (409).
 */
@Injectable()
export class RecibosHttp extends RepositorioHttp<Recibo, FiltrosRecibo> implements RecibosRepositorio {
  protected readonly recurso = 'recibos';
}
