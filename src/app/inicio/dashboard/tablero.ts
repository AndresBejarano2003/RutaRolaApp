import { MedioPago } from 'src/app/finanzas/recibos/recibo';
import { NivelNotificacion } from '../notificaciones/notificacion-sistema';

/**
 * Resumen de la pantalla de inicio. Con API lo calcula el servidor (`GET /tablero`);
 * hoy lo calcula `calcularTablero` con los datos locales.
 */
export interface Tablero {
  /** Mes en curso `YYYY-MM`. */
  periodo: string;
  recaudo: {
    /** Recibos vigentes que pagan el mes en curso. */
    recaudado: number;
    /** Suma del valor mensual de las facturas vigentes que cubren el mes. */
    esperado: number;
    pagos: number;
    /** Recaudado del mes anterior (para comparar). */
    anterior: number;
  };
  cartera: {
    /** Valor de las cuotas con la fecha límite vencida. */
    vencida: number;
    cuotasVencidas: number;
    acudientesEnMora: number;
    /** Cuotas del mes que aún están dentro del plazo. */
    porVencer: number;
  };
  estudiantes: { activos: number; sinRuta: number; nuevosMes: number; colegios: number };
  operacion: {
    rutasActivas: number;
    rutasSinAsignacion: number;
    vehiculosActivos: number;
    conductoresActivos: number;
    /** % de cupos usados en las rutas con vehículo asignado (`null` si no hay ninguna). */
    ocupacion: number | null;
  };
  /** Lo que hay que resolver, de lo más grave a lo menos (solo lo que tiene cantidad > 0). */
  pendientes: PendienteTablero[];
  /** Fechas de los próximos `DIAS_AGENDA` días, de la más cercana a la más lejana. */
  agenda: EventoAgenda[];
  ultimosPagos: PagoReciente[];
  /** Últimos 12 meses, del más antiguo al actual. */
  historico: { periodo: string; facturado: number; recaudado: number }[];
  estudiantesPorColegio: { colegio: string; cantidad: number }[];
  ocupacionRutas: OcupacionRuta[];
}

export interface PendienteTablero {
  id: string;
  nivel: NivelNotificacion;
  icono: string;
  titulo: string;
  detalle: string;
  cantidad: number;
  enlace: string;
}

export type TipoEventoAgenda = 'DOCUMENTO' | 'LICENCIA' | 'PAGO' | 'CONTRATO';

export interface EventoAgenda {
  /** `YYYY-MM-DD` */
  fecha: string;
  tipo: TipoEventoAgenda;
  titulo: string;
  detalle: string;
  enlace: string;
}

export interface PagoReciente {
  id: string;
  numero: string;
  nombreAcudiente: string;
  nombreEstudiante: string;
  periodo: string;
  fechaPago: string;
  valor: number;
  medioPago: MedioPago;
}

export interface OcupacionRuta {
  ruta: string;
  estudiantes: number;
  /** Capacidad del vehículo asignado; `null` si la ruta no tiene asignación activa. */
  capacidad: number | null;
}

/** Días hacia adelante que muestra la agenda. */
export const DIAS_AGENDA = 30;

export const TABLERO_VACIO: Tablero = {
  periodo: '',
  recaudo: { recaudado: 0, esperado: 0, pagos: 0, anterior: 0 },
  cartera: { vencida: 0, cuotasVencidas: 0, acudientesEnMora: 0, porVencer: 0 },
  estudiantes: { activos: 0, sinRuta: 0, nuevosMes: 0, colegios: 0 },
  operacion: { rutasActivas: 0, rutasSinAsignacion: 0, vehiculosActivos: 0, conductoresActivos: 0, ocupacion: null },
  pendientes: [],
  agenda: [],
  ultimosPagos: [],
  historico: [],
  estudiantesPorColegio: [],
  ocupacionRutas: [],
};

export const ICONOS_AGENDA: Record<TipoEventoAgenda, string> = {
  DOCUMENTO: 'fa-solid fa-file-shield',
  LICENCIA: 'fa-solid fa-id-card',
  PAGO: 'fa-solid fa-money-bill-wave',
  CONTRATO: 'fa-solid fa-file-signature',
};
