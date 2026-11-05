import { Entidad, EstadoRegistro } from 'src/app/shared/crud/crud';

export interface Ruta extends Entidad {
  /** Código corto único, p. ej. `R-01`. */
  codigo: string;
  nombre: string;
  colegioId: string;
  jornada: string;
  /** Barrios o sectores que recorre. */
  sector: string;
  /** Estudiantes (del mismo colegio) que transporta. */
  estudianteIds: string[];
  estado: EstadoRegistro;
  observaciones: string;
}

export interface FiltrosRuta {
  /** Busca en código, nombre y sector. */
  texto: string;
  colegioId: string;
  jornada: string;
  estado: EstadoRegistro | '';
  /** Rutas que llevan a este estudiante. */
  estudianteId: string;
}

export const FILTROS_RUTA_VACIOS: FiltrosRuta = { texto: '', colegioId: '', jornada: '', estado: '', estudianteId: '' };

export function etiquetaRuta(r: Pick<Ruta, 'codigo' | 'nombre'>): string {
  return `${r.codigo} · ${r.nombre}`;
}
