import { RepositorioLectura } from 'src/app/shared/crud/repositorio-crud';
import { FiltrosMensajeWhatsapp, MensajeWhatsapp } from './mensaje-whatsapp';

/** Registro de WhatsApp (solo lectura; implementación en `core/repositorios.ts`). */
export abstract class MensajesWhatsappRepositorio extends RepositorioLectura<MensajeWhatsapp, FiltrosMensajeWhatsapp> {}
