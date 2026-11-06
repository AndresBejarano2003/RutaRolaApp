import { Observable } from 'rxjs';
import { Empresa } from 'src/app/inicio/configuracion/configuracion';
import { RepositorioLectura } from 'src/app/shared/crud/repositorio-crud';
import { FiltrosEmpresa, SolicitudEmpresa } from './empresa';

/**
 * Empresas de transporte de la plataforma (solo SUPER_ADMIN). No se eliminan: se dejan INACTIVAS
 * (sus usuarios ya no pueden entrar). Implementaciones: `EmpresasLocal` → `EmpresasHttp`.
 */
export abstract class EmpresasRepositorio extends RepositorioLectura<Empresa, FiltrosEmpresa> {
  abstract crear(solicitud: SolicitudEmpresa): Observable<Empresa>;
  abstract actualizar(id: string, solicitud: SolicitudEmpresa): Observable<Empresa>;
}
