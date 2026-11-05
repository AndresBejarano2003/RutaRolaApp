import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface MensajeWhatsapp {
  telefono: string;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/whatsapp/enviar.php`;

  enviarMensaje(datos: MensajeWhatsapp): Observable<unknown> {
    return this.http.post(this.apiUrl, datos);
  }
}
