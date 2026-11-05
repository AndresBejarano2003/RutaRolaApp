import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { Entidad, EstadoRegistro } from 'src/app/shared/crud/crud';
import { periodosEntre } from 'src/app/shared/fechas/fechas';

/**
 * Factura de contratación del servicio: un estudiante, su acudiente y el
 * valor MENSUAL contratado durante un periodo (p. ej. feb–nov). Los pagos
 * de cada mes se registran como recibos.
 */
export interface Factura extends Entidad {
  /** Consecutivo generado al crear (`FAC-0001`). */
  numero: string;
  /** `YYYY-MM-DD` */
  fechaEmision: string;
  acudienteId: string;
  estudianteId: string;
  /** Nombres al momento de emitir (la factura conserva los datos con que se expidió). */
  nombreAcudiente: string;
  nombreEstudiante: string;
  /** Valor mensual de la contratación (COP). */
  valorContratacion: number;
  /** Primer y último mes del servicio, `YYYY-MM`. */
  periodoInicio: string;
  periodoFin: string;
  concepto: string;
  /** ACTIVO = vigente, INACTIVO = anulada. */
  estado: EstadoRegistro;
  observaciones: string;
}

export interface FiltrosFactura {
  /** Busca en número, acudiente y estudiante. */
  texto: string;
  acudienteId: string;
  estudianteId: string;
  estado: EstadoRegistro | '';
}

export const FILTROS_FACTURA_VACIOS: FiltrosFactura = { texto: '', acudienteId: '', estudianteId: '', estado: '' };

export const ESTADOS_FACTURA: OpcionCatalogo[] = [
  { id: 'ACTIVO', nombre: 'Vigente' },
  { id: 'INACTIVO', nombre: 'Anulada' },
];

export function mesesFactura(f: Pick<Factura, 'periodoInicio' | 'periodoFin'>): string[] {
  return periodosEntre(f.periodoInicio, f.periodoFin);
}

export function totalFactura(f: Pick<Factura, 'periodoInicio' | 'periodoFin' | 'valorContratacion'>): number {
  return mesesFactura(f).length * f.valorContratacion;
}

export function etiquetaFactura(f: Pick<Factura, 'numero' | 'nombreEstudiante'>): string {
  return `${f.numero} · ${f.nombreEstudiante}`;
}
