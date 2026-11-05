import { Injectable } from '@angular/core';

export interface Credenciales {
  usuario: string;
  contrasena: string;
}

export interface UsuarioSesion {
  nombre: string;
  correo: string;
  imagen: string;
  enLinea: boolean;
  rol: string;
}

/** Usuario de ejemplo (barra superior, saludo del inicio) hasta que exista el login real. */
export const USUARIO_DEMO: UsuarioSesion = {
  nombre: 'Andrés Bejarano',
  correo: 'andres@rutarola.com',
  imagen: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
  enLinea: true,
  rol: 'Administrador',
};

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
