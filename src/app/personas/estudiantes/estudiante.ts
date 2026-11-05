import { Entidad } from 'src/app/shared/crud/crud';

export type EstadoEstudiante = 'ACTIVO' | 'INACTIVO';

export interface Estudiante extends Entidad {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  /** `YYYY-MM-DD` */
  fechaNacimiento: string;
  direccion: string;
  acudienteId: string;
  colegioId: string;
  grado: string;
  jornada: string;
  estado: EstadoEstudiante;
  observaciones: string;
}

export interface FiltrosEstudiante {
  /** Busca en nombres, apellidos y número de documento. */
  texto: string;
  colegioId: string;
  grado: string;
  estado: EstadoEstudiante | '';
}

export const FILTROS_ESTUDIANTE_VACIOS: FiltrosEstudiante = { texto: '', colegioId: '', grado: '', estado: '' };

export const ESTADOS_ESTUDIANTE: { id: EstadoEstudiante; nombre: string }[] = [
  { id: 'ACTIVO', nombre: 'Activo' },
  { id: 'INACTIVO', nombre: 'Inactivo' },
];

export function nombreCompleto(e: Pick<Estudiante, 'primerNombre' | 'segundoNombre' | 'primerApellido' | 'segundoApellido'>): string {
  return [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido].filter(Boolean).join(' ');
}

/** Edad en años cumplidos a partir de `YYYY-MM-DD`. */
export function calcularEdad(fechaNacimiento: string, hoy = new Date()): number | null {
  if (!fechaNacimiento) {
    return null;
  }
  const [anio, mes, dia] = fechaNacimiento.split('-').map(Number);
  let edad = hoy.getFullYear() - anio;
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) {
    edad--;
  }
  return edad;
}
