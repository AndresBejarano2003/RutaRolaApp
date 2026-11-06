import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Credenciales, ROLES_USUARIO, RolUsuario, Sesion, TokensSesion } from 'src/app/core/auth';
import { ErrorCrud } from 'src/app/shared/crud/crud';
import { AutenticacionRepositorio } from './autenticacion-repositorio';

/** Respuesta de `POST /auth/login`. */
export interface RespuestaLogin {
  /** `rol` puede ser también `SUPER_ADMIN` (plataforma), que no entra a esta aplicación. */
  sesion: Omit<Sesion, 'tokens' | 'rol'> & { rol: string };
  tokens: TokensSesion;
}

/**
 * `POST {apiUrl}/auth/login` `{usuario, contrasena}` → `{ sesion, tokens }` (ver `api/README.md`).
 * `usuario` puede ser el usuario de ingreso o el correo. El SERVIDOR decide el rol:
 * - empleado activo (Personas › Empleados) → CONDUCTOR/MONITORA y `empleadoId`;
 * - acudiente activo (Personas › Acudientes) → ACUDIENTE y `acudienteId`;
 * - administrador de la empresa → ADMINISTRADOR.
 * 401 `Usuario o contraseña incorrectos.`; 403 usuario, empresa o persona inactivos (con `{mensaje}`).
 * Los tokens viajan dentro de la sesión; `interceptorAutenticacion` los usa y los renueva.
 */
@Injectable()
export class AutenticacionHttp extends AutenticacionRepositorio {
  private readonly http = inject(HttpClient);

  iniciarSesion({ usuario, contrasena }: Credenciales): Observable<Sesion> {
    return this.http
      .post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, { usuario: usuario.trim(), contrasena })
      .pipe(
        map(({ sesion, tokens }) => {
          if (!ROLES_USUARIO.some((r) => r.id === sesion.rol)) {
            throw new ErrorCrud('Este usuario no tiene acceso a esta aplicación.', 'VALIDACION');
          }
          return { ...sesion, rol: sesion.rol as RolUsuario, tokens };
        }),
      );
  }
}
