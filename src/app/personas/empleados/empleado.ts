import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { ArchivoAdjunto } from 'src/app/shared/archivo-adjunto/archivo-adjunto';
import { Entidad, EstadoRegistro } from 'src/app/shared/crud/crud';
import { DatosPersona } from '../compartido/persona';

export type TipoEmpleado = 'CONDUCTOR' | 'MONITORA';
export type TipoContrato = 'TERMINO_INDEFINIDO' | 'TERMINO_FIJO' | 'OBRA_LABOR' | 'PRESTACION_SERVICIOS';

export interface Empleado extends Entidad, DatosPersona {
  tipoEmpleado: TipoEmpleado;
  telefono: string;
  correo: string;
  direccion: string;
  /** `YYYY-MM-DD` */
  fechaIngreso: string;
  /** Sueldo mensual en pesos colombianos. */
  sueldo: number;
  tipoContrato: TipoContrato;
  contrato: ArchivoAdjunto | null;
  /** Licencia de conducción: obligatoria para conductores; vacía para monitoras. */
  numeroLicencia: string;
  categoriaLicencia: string;
  /** `YYYY-MM-DD` */
  vencimientoLicencia: string;
  estado: EstadoRegistro;
}

export interface FiltrosEmpleado {
  /** Busca en nombres, apellidos y número de documento. */
  texto: string;
  tipoEmpleado: TipoEmpleado | '';
  estado: EstadoRegistro | '';
}

export const FILTROS_EMPLEADO_VACIOS: FiltrosEmpleado = { texto: '', tipoEmpleado: '', estado: '' };

export const TIPOS_EMPLEADO: { id: TipoEmpleado; nombre: string; icono: string }[] = [
  { id: 'CONDUCTOR', nombre: 'Conductor', icono: 'fa-solid fa-bus' },
  { id: 'MONITORA', nombre: 'Monitora', icono: 'fa-solid fa-person-chalkboard' },
];

export const TIPOS_CONTRATO: { id: TipoContrato; nombre: string }[] = [
  { id: 'TERMINO_INDEFINIDO', nombre: 'Término indefinido' },
  { id: 'TERMINO_FIJO', nombre: 'Término fijo' },
  { id: 'OBRA_LABOR', nombre: 'Obra o labor' },
  { id: 'PRESTACION_SERVICIOS', nombre: 'Prestación de servicios' },
];

/** Categorías de licencia de conducción en Colombia (B: particular, C: servicio público). */
export const CATEGORIAS_LICENCIA: OpcionCatalogo[] = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'].map((c) => ({
  id: c,
  nombre: c,
}));

/** Días antes del vencimiento en los que se alerta que la licencia está por vencer. */
export const DIAS_ALERTA_LICENCIA = 30;

export type EstadoLicencia = 'VIGENTE' | 'POR_VENCER' | 'VENCIDA';

export function estadoLicencia(vencimiento: string, hoy = new Date()): EstadoLicencia | null {
  if (!vencimiento) {
    return null;
  }
  const hoyTexto = hoy.toISOString().slice(0, 10);
  if (vencimiento < hoyTexto) {
    return 'VENCIDA';
  }
  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + DIAS_ALERTA_LICENCIA);
  return vencimiento <= limite.toISOString().slice(0, 10) ? 'POR_VENCER' : 'VIGENTE';
}
