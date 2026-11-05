import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, RolUsuario, rutaInicio } from './auth';

/**
 * Solo deja entrar a los roles indicados. Sin sesión → `/login?volver=<url>`;
 * con otro rol → la entrada de SU sistema (un conductor nunca ve el administrativo y viceversa).
 */
export function soloRoles(...roles: RolUsuario[]): CanActivateFn {
  return (_ruta, estado) => {
    const router = inject(Router);
    const rol = inject(AuthService).rol();
    if (!rol) return router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
    return roles.includes(rol) || router.parseUrl(rutaInicio(rol));
  };
}

/** El login solo se muestra sin sesión; con sesión se va a la entrada de su rol. */
export const soloInvitados: CanActivateFn = () => {
  const rol = inject(AuthService).rol();
  return !rol || inject(Router).parseUrl(rutaInicio(rol));
};

/** `volver` solo puede ser una ruta interna (evita redirecciones abiertas). */
export function rutaInternaSegura(url: string | null): string | null {
  return url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login') ? url : null;
}
