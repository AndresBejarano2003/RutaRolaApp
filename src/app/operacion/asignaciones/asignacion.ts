import { Entidad, EstadoRegistro } from 'src/app/shared/crud/crud';

/** Vehículo + conductor (+ monitora) que cubren una ruta durante un periodo. */
export interface Asignacion extends Entidad {
  rutaId: string;
  vehiculoId: string;
  /** Empleado de tipo CONDUCTOR. */
  conductorId: string;
  /** Empleado de tipo MONITORA (opcional). */
  monitoraId: string;
  /** `YYYY-MM-DD` */
  fechaInicio: string;
  /** `YYYY-MM-DD`; vacío = indefinida. */
  fechaFin: string;
  estado: EstadoRegistro;
  observaciones: string;
}

export interface FiltrosAsignacion {
  rutaId: string;
  vehiculoId: string;
  /** Conductor o monitora. */
  empleadoId: string;
  estado: EstadoRegistro | '';
}

export const FILTROS_ASIGNACION_VACIOS: FiltrosAsignacion = { rutaId: '', vehiculoId: '', empleadoId: '', estado: '' };
