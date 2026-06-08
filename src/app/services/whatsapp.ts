import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost/api/whatsapp/enviar.php';

  enviarMensaje(data: any) {

    return this.http.post(
      this.apiUrl,
      data
    );

  }

}