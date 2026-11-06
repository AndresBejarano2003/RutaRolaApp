import { Injectable, inject } from '@angular/core';
import { ListadoStore } from 'src/app/shared/crud/listado-store';
import { FILTROS_MENSAJE_WHATSAPP_VACIOS, FiltrosMensajeWhatsapp, MensajeWhatsapp } from './mensaje-whatsapp';
import { MensajesWhatsappRepositorio } from './mensajes-whatsapp-repositorio';

@Injectable()
export class MensajesWhatsappStore extends ListadoStore<MensajeWhatsapp, FiltrosMensajeWhatsapp> {
  protected readonly repositorio = inject(MensajesWhatsappRepositorio);

  constructor() {
    super(FILTROS_MENSAJE_WHATSAPP_VACIOS);
  }
}
