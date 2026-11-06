import { Observable } from 'rxjs';
import { DatosEmpresa, Empresa, Parametro } from './configuracion';

/**
 * Datos de la empresa del administrador y sus parámetros. Implementaciones: `ConfiguracionLocal`
 * (temporal, en el navegador) → `ConfiguracionHttp`.
 */
export abstract class ConfiguracionRepositorio {
  abstract empresa(): Observable<Empresa>;
  abstract guardarEmpresa(datos: DatosEmpresa): Observable<Empresa>;
  abstract parametros(): Observable<Parametro[]>;
  abstract guardarParametro(clave: string, valor: string): Observable<Parametro>;
}
