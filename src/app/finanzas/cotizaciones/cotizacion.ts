import { Entidad } from 'src/app/shared/crud/crud';

export type EstadoCotizacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

/** Estudiante incluido en la cotización: registrado (`estudianteId`) o solo nombre (cliente nuevo). */
export interface EstudianteCotizado {
  estudianteId: string | null;
  nombre: string;
}

export interface Cotizacion extends Entidad {
  /** Consecutivo generado al crear (`COT-0001`). */
  numero: string;
  /** `YYYY-MM-DD` */
  fecha: string;
  /** ¿El acudiente y los estudiantes ya existen en el sistema? */
  registrados: boolean;
  /** Solo si `registrados`. */
  acudienteId: string | null;
  nombreAcudiente: string;
  telefonoAcudiente: string;
  estudiantes: EstudianteCotizado[];
  valorPorEstudiante: number;
  /** `valorPorEstudiante × estudiantes.length` (lo recalcula el servidor). */
  valorTotal: number;
  estado: EstadoCotizacion;
  observaciones: string;
}

export interface FiltrosCotizacion {
  /** Busca en número, acudiente y estudiantes. */
  texto: string;
  estado: EstadoCotizacion | '';
  /** Fecha desde / hasta (`YYYY-MM-DD`). */
  desde: string;
  hasta: string;
}

export const FILTROS_COTIZACION_VACIOS: FiltrosCotizacion = { texto: '', estado: '', desde: '', hasta: '' };

export const ESTADOS_COTIZACION: { id: EstadoCotizacion; nombre: string; clase: string }[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', clase: 'badge-warning' },
  { id: 'APROBADA', nombre: 'Aprobada', clase: 'badge-success' },
  { id: 'RECHAZADA', nombre: 'Rechazada', clase: 'badge-error' },
];

export function calcularTotal(valorPorEstudiante: number, cantidad: number): number {
  return Math.max(0, valorPorEstudiante) * cantidad;
}
