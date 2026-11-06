import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pagina, Paginacion } from 'src/app/shared/crud/crud';
import { FuenteLocal } from 'src/app/shared/crud/repositorio-local';
import { FiltrosMensajeWhatsapp, MensajeWhatsapp } from './mensaje-whatsapp';
import { MensajesWhatsappRepositorio } from './mensajes-whatsapp-repositorio';

/** En modo local nadie envía mensajes (los envía el proceso del servidor): el registro está vacío. */
@Injectable()
export class MensajesWhatsappLocal extends MensajesWhatsappRepositorio implements FuenteLocal {
  readonly modoLocal = true as const;

  listar(_filtros: FiltrosMensajeWhatsapp, { pagina, tamano }: Paginacion): Observable<Pagina<MensajeWhatsapp>> {
    return of({ items: [], total: 0, pagina, tamano });
  }
}
