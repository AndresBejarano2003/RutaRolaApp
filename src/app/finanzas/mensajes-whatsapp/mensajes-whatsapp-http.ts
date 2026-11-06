import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Pagina, Paginacion } from 'src/app/shared/crud/crud';
import { FiltrosMensajeWhatsapp, MensajeWhatsapp } from './mensaje-whatsapp';
import { MensajesWhatsappRepositorio } from './mensajes-whatsapp-repositorio';

/**
 * `GET {apiUrl}/mensajes-whatsapp?texto=&acudienteId=&estado=&desde=&hasta=&pagina=&tamano=`
 * (`mensajes.leer`) → `Pagina<MensajeWhatsapp>`, del más reciente al más antiguo. Los crea el proceso de
 * cobro del servidor (`ServicioCobros`), nunca el cliente. `texto` busca en teléfono, mensaje y acudiente.
 */
@Injectable()
export class MensajesWhatsappHttp extends MensajesWhatsappRepositorio {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosMensajeWhatsapp, paginacion: Paginacion): Observable<Pagina<MensajeWhatsapp>> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries({ ...filtros, ...paginacion })) {
      if (valor !== '') params = params.set(clave, String(valor));
    }
    return this.http.get<Pagina<MensajeWhatsapp>>(`${environment.apiUrl}/mensajes-whatsapp`, { params });
  }
}
