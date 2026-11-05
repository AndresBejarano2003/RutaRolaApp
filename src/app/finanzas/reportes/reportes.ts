import { MedioPago, Recibo } from '../recibos/recibo';

/** Día límite de pago cuando la factura no tiene programación. */
export const DIA_LIMITE_PREDETERMINADO = 5;

export interface FiltrosIngresos {
  /** Meses `YYYY-MM` (por fecha de pago). */
  desde: string;
  hasta: string;
  medioPago: MedioPago | '';
}

export interface ReporteIngresos {
  total: number;
  cantidad: number;
  promedio: number;
  porMes: { periodo: string; total: number; cantidad: number }[];
  porMedio: { medioPago: MedioPago; total: number; cantidad: number }[];
  recibos: Recibo[];
}

/** Mensualidad de una factura vigente que aún no tiene recibo válido. */
export interface CuotaPendiente {
  facturaId: string;
  numeroFactura: string;
  acudienteId: string;
  nombreAcudiente: string;
  nombreEstudiante: string;
  /** `YYYY-MM` */
  periodo: string;
  valor: number;
  /** `YYYY-MM-DD` */
  fechaLimite: string;
  /** Días desde la fecha límite (> 0 = vencida). */
  diasMora: number;
}

export interface FiltrosPendientes {
  texto: string;
  acudienteId: string;
  /** `VENCIDAS` = en mora, `POR_VENCER` = aún dentro del plazo. */
  situacion: 'VENCIDAS' | 'POR_VENCER' | '';
}

/** Acudiente con al menos una cuota vencida. */
export interface Moroso {
  acudienteId: string;
  nombreAcudiente: string;
  telefono: string;
  correo: string;
  estudiantes: string[];
  facturas: string[];
  cuotas: number;
  valorAdeudado: number;
  /** Mora de la cuota más antigua. */
  diasMoraMaxima: number;
  periodos: string[];
}

export interface FiltrosMorosos {
  texto: string;
  /** Mora mínima en días (0 = todos). */
  diasMinimos: number;
}

export const RANGOS_MORA = [
  { id: '0', nombre: 'Cualquier mora' },
  { id: '30', nombre: 'Más de 30 días' },
  { id: '60', nombre: 'Más de 60 días' },
  { id: '90', nombre: 'Más de 90 días' },
];
