import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';

export type EstadoMensajeWhatsapp = 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'LEIDO' | 'FALLIDO';

/** Mensaje de WhatsApp que envió el SERVIDOR (recordatorios de cobro). Solo lectura. */
export interface MensajeWhatsapp {
  id: string;
  acudienteId: string;
  nombreAcudiente: string;
  estudianteId: string | null;
  nombreEstudiante: string;
  telefono: string;
  mensaje: string;
  estado: EstadoMensajeWhatsapp;
  /** ISO */
  fechaCreacion: string;
  /** ISO */
  fechaEnvio: string | null;
  /** Respuesta del proveedor (motivo del fallo, id…). */
  respuesta: string;
}

/** `desde`/`hasta`: fecha (`YYYY-MM-DD`) de creación. */
export interface FiltrosMensajeWhatsapp {
  texto: string;
  acudienteId: string;
  estado: EstadoMensajeWhatsapp | '';
  desde: string;
  hasta: string;
}

export const FILTROS_MENSAJE_WHATSAPP_VACIOS: FiltrosMensajeWhatsapp = { texto: '', acudienteId: '', estado: '', desde: '', hasta: '' };

export const ESTADOS_MENSAJE_WHATSAPP: (OpcionCatalogo & { id: EstadoMensajeWhatsapp; badge: string })[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', badge: 'bg-base-300 text-base-content' },
  { id: 'ENVIADO', nombre: 'Enviado', badge: 'badge-soft badge-info' },
  { id: 'ENTREGADO', nombre: 'Entregado', badge: 'badge-soft badge-success' },
  { id: 'LEIDO', nombre: 'Leído', badge: 'badge-soft badge-success' },
  { id: 'FALLIDO', nombre: 'Fallido', badge: 'badge-soft badge-error' },
];
