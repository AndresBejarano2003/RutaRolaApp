import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { Factura, FiltrosFactura } from './factura';
import { FacturasRepositorio } from './facturas-repositorio';

/**
 * Conexión al API: `{apiUrl}/facturas` (filtros `texto`, `acudienteId`,
 * `estudianteId`, `estado`). El API genera `numero` y valida: el estudiante
 * pertenece al acudiente, una sola factura vigente por estudiante en
 * periodos que se crucen (409), y `DELETE` responde 409 si tiene recibos o
 * programación.
 */
@Injectable()
export class FacturasHttp extends RepositorioHttp<Factura, FiltrosFactura> implements FacturasRepositorio {
  protected readonly recurso = 'facturas';
}
