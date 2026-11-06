import { Empresa } from 'src/app/inicio/configuracion/configuracion';
import { EstadoRegistro } from 'src/app/shared/crud/crud';

export interface FiltrosEmpresa {
  texto: string;
  estado: EstadoRegistro | '';
}

export const FILTROS_EMPRESA_VACIOS: FiltrosEmpresa = { texto: '', estado: '' };

/** Primer administrador de la empresa (opcional, solo al crearla). */
export interface AdministradorInicial {
  nombre: string;
  usuario: string;
  email: string;
  contrasena: string;
}

/** `POST /empresas` y `PUT /empresas/{id}`. */
export type SolicitudEmpresa = Pick<Empresa, 'nombre' | 'nit' | 'direccion' | 'ciudad' | 'telefono' | 'email' | 'logoUrl' | 'estado'> & {
  administrador?: AdministradorInicial | null;
};
