import { Entidad, EstadoRegistro } from 'src/app/shared/crud/crud';
import { DatosAcceso } from '../compartido/acceso';
import { DatosPersona } from '../compartido/persona';

/**
 * Persona responsable de uno o varios estudiantes. Con `usuario`/`contrasena` (ver `DatosAcceso`)
 * ingresa al Portal del acudiente.
 */
export interface Acudiente extends Entidad, DatosPersona, DatosAcceso {
  telefono: string;
  telefonoAlterno: string;
  correo: string;
  direccion: string;
  estado: EstadoRegistro;
}

export interface FiltrosAcudiente {
  /** Busca en nombres, apellidos y número de documento. */
  texto: string;
  estado: EstadoRegistro | '';
}

export const FILTROS_ACUDIENTE_VACIOS: FiltrosAcudiente = { texto: '', estado: '' };
