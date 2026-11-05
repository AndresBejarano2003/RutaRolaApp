import { Injectable } from '@angular/core';

export interface Credenciales {
  usuario: string;
  contrasena: string;
}

/**
 * Autenticación PROVISIONAL.
 *
 * Todavía no existe un backend (`api/` está vacío), así que este servicio
 * solo valida que los campos tengan contenido. Reemplazar `iniciarSesion`
 * por una llamada HTTP cuando exista el endpoint de login.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  iniciarSesion({ usuario, contrasena }: Credenciales): boolean {
    return usuario.trim().length > 0 && contrasena.length > 0;
  }

  cerrarSesion(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
