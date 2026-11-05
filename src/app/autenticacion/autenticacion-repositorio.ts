import { Observable } from 'rxjs';
import { Credenciales, Sesion } from 'src/app/core/auth';

/**
 * Valida credenciales y devuelve la sesión con el TIPO DE USUARIO, que decide a qué
 * sistema entra (`rutaInicio(rol)`). Falla con `ErrorCrud` (`VALIDACION`) si no son válidas.
 * Implementaciones: `AutenticacionLocal` (temporal) → `AutenticacionHttp` (`POST /auth/login`).
 */
export abstract class AutenticacionRepositorio {
  abstract iniciarSesion(credenciales: Credenciales): Observable<Sesion>;
}
