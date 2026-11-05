import { GRADOS, ordenGrado } from 'src/app/shared/catalogos/catalogos';
import { Entidad, EstadoRegistro } from 'src/app/shared/crud/crud';

/** Curso (grado) que ofrece un colegio, con su horario. */
export interface Curso {
  /** Id del grado en `GRADOS` (Jardín, Transición, 1° ... 11°). */
  grado: string;
  /** `HH:mm` */
  horaEntrada: string;
  /** `HH:mm` */
  horaSalida: string;
  estado: EstadoRegistro;
}

export interface Colegio extends Entidad {
  nit: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  /** Cursos parametrizados, ordenados de Jardín a Once. */
  cursos: Curso[];
  estado: EstadoRegistro;
}

export interface FiltrosColegio {
  /** Busca en razón social y NIT. */
  texto: string;
  estado: EstadoRegistro | '';
}

export const FILTROS_COLEGIO_VACIOS: FiltrosColegio = { texto: '', estado: '' };

/** Grado desde el que se generan los cursos con "Agregar cursos". */
export const GRADO_INICIAL = GRADOS[0].id;

export function ordenarCursos(cursos: Curso[]): Curso[] {
  return [...cursos].sort((a, b) => ordenGrado(a.grado) - ordenGrado(b.grado));
}

/**
 * Regla "Agregar cursos": llena desde Jardín hasta `hasta` con el horario
 * indicado. Los cursos que ya existen en ese rango toman el nuevo horario;
 * los demás se conservan.
 */
export function generarCursos(actuales: Curso[], hasta: string, horaEntrada: string, horaSalida: string): Curso[] {
  const limite = ordenGrado(hasta);
  const rango = GRADOS.slice(0, limite + 1).map((g) => g.id);
  const resultado = actuales.filter((c) => !rango.includes(c.grado));
  for (const grado of rango) {
    const existente = actuales.find((c) => c.grado === grado);
    resultado.push({ grado, horaEntrada, horaSalida, estado: existente?.estado ?? 'ACTIVO' });
  }
  return ordenarCursos(resultado);
}

/** Texto corto de los cursos activos, p. ej. "Jardín – 11°". */
export function rangoCursos(cursos: Curso[]): string {
  const activos = ordenarCursos(cursos.filter((c) => c.estado === 'ACTIVO'));
  if (!activos.length) return 'Sin cursos';
  const primero = activos[0].grado;
  const ultimo = activos[activos.length - 1].grado;
  return primero === ultimo ? primero : `${primero} – ${ultimo}`;
}
