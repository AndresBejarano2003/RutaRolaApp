import { ArchivoAdjunto } from 'src/app/shared/archivo-adjunto/archivo-adjunto';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { Entidad, EstadoRegistro } from 'src/app/shared/crud/crud';

/** `EN_USO` = el mensaje que se envía (solo uno por canal); `ACTIVO` = disponible; `INACTIVO` = archivado. */
export type EstadoPlantilla = 'EN_USO' | 'ACTIVO' | 'INACTIVO';
export type CanalEnvio = 'WHATSAPP' | 'EMAIL';

/** Mensaje predefinido de WhatsApp (solo `cuerpo`) o de correo (`asunto`, `cuerpo`, `adjuntos`). */
export interface PlantillaMensaje {
  id: string;
  asunto: string;
  cuerpo: string;
  adjuntos: ArchivoAdjunto[];
  estado: EstadoPlantilla;
}

/** Envío automático mensual del cobro de una factura. */
export interface Programacion extends Entidad {
  nombre: string;
  facturaId: string;
  numeroFactura: string;
  /** Día límite de pago de cada mes (1–31; si el mes es más corto, el último día). */
  diaLimitePago: number;
  /** Días antes del día límite en que se envía el cobro (1–10). */
  diasPrevios: number;
  whatsapp: boolean;
  mensajesWhatsapp: PlantillaMensaje[];
  email: boolean;
  correos: PlantillaMensaje[];
  estado: EstadoRegistro;
}

export interface FiltrosProgramacion {
  /** Busca en nombre y número de factura. */
  texto: string;
  facturaId: string;
  estado: EstadoRegistro | '';
}

export const FILTROS_PROGRAMACION_VACIOS: FiltrosProgramacion = { texto: '', facturaId: '', estado: '' };

/** Registro de un envío (lo genera el proceso automático del servidor). */
export interface EnvioProgramado {
  id: string;
  programacionId: string;
  /** ISO */
  fecha: string;
  canal: CanalEnvio;
  destinatario: string;
  /** Mes cobrado, `YYYY-MM`. */
  periodo: string;
  estado: 'ENVIADO' | 'FALLIDO';
  detalle: string;
}

export const ESTADOS_PLANTILLA: { id: EstadoPlantilla; nombre: string }[] = [
  { id: 'EN_USO', nombre: 'En uso' },
  { id: 'ACTIVO', nombre: 'Activo' },
  { id: 'INACTIVO', nombre: 'Inactivo' },
];

export const DIAS_MES: OpcionCatalogo[] = Array.from({ length: 31 }, (_, i) => ({ id: String(i + 1), nombre: `Día ${i + 1}` }));
export const DIAS_PREVIOS: OpcionCatalogo[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  nombre: i === 0 ? '1 día antes' : `${i + 1} días antes`,
}));

/** Variables que se reemplazan al enviar. */
export const VARIABLES_MENSAJE = [
  { clave: '{acudiente}', descripcion: 'Nombre del acudiente', ejemplo: 'María Pérez López' },
  { clave: '{estudiante}', descripcion: 'Nombre del estudiante', ejemplo: 'Juan Sebastián Pérez López' },
  { clave: '{factura}', descripcion: 'Número de factura', ejemplo: 'FAC-0001' },
  { clave: '{mes}', descripcion: 'Mes que se cobra', ejemplo: 'noviembre de 2026' },
  { clave: '{valor}', descripcion: 'Valor a pagar', ejemplo: '$ 420.000' },
  { clave: '{fecha_limite}', descripcion: 'Fecha límite de pago', ejemplo: '5 nov 2026' },
] as const;

export function aplicarVariables(texto: string, valores: Partial<Record<string, string>> = {}): string {
  return VARIABLES_MENSAJE.reduce((t, v) => t.replaceAll(v.clave, valores[v.clave] ?? v.ejemplo), texto);
}

export function plantillaEnUso(plantillas: PlantillaMensaje[]): PlantillaMensaje | undefined {
  return plantillas.find((p) => p.estado === 'EN_USO');
}
