import { Injectable, computed, signal } from '@angular/core';

export interface Credenciales {
  usuario: string;
  contrasena: string;
  /** `true`: la sesión sobrevive al cerrar el navegador (localStorage); si no, solo la pestaña (sessionStorage). */
  recordar?: boolean;
}

/**
 * Tipos de usuario. Cada uno entra a SU sistema:
 * - `ADMINISTRADOR` → sistema administrativo (`/inicio`, todos los módulos).
 * - `CONDUCTOR` / `MONITORA` → app de la ruta del día (`/ruta-del-dia`).
 */
export type RolUsuario = 'ADMINISTRADOR' | 'CONDUCTOR' | 'MONITORA';

export const ROLES_USUARIO: { id: RolUsuario; nombre: string; inicio: string }[] = [
  { id: 'ADMINISTRADOR', nombre: 'Administrador', inicio: '/inicio' },
  { id: 'CONDUCTOR', nombre: 'Conductor', inicio: '/ruta-del-dia' },
  { id: 'MONITORA', nombre: 'Monitora', inicio: '/ruta-del-dia' },
];

/** Roles que usan la app de la ruta del día. */
export const ROLES_OPERATIVOS: RolUsuario[] = ['CONDUCTOR', 'MONITORA'];

/** Usuario autenticado (lo que devuelve `POST /auth/login`, sin el token). */
export interface Sesion {
  /** Usuario con el que ingresó (correo o número de documento). */
  usuario: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  /** Empleado vinculado (conductor/monitora); `null` para administradores. */
  empleadoId: string | null;
  /** Foto de perfil; vacía = iniciales. */
  imagen: string;
  /** ISO de inicio de sesión. */
  inicio: string;
}

/** Perfil de ejemplo del administrador mientras no existe el login real. */
export const USUARIO_DEMO = {
  nombre: 'Andrés Bejarano',
  correo: 'andres@rutarola.com',
  imagen: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
};

/** Clave donde se guarda la sesión (localStorage si "Recordarme", si no sessionStorage). */
export const CLAVE_SESION = 'rutarola.sesion';

export function nombreRol(rol: RolUsuario): string {
  return ROLES_USUARIO.find((r) => r.id === rol)?.nombre ?? rol;
}

/** Ruta de entrada de cada tipo de usuario. */
export function rutaInicio(rol: RolUsuario): string {
  return ROLES_USUARIO.find((r) => r.id === rol)?.inicio ?? '/login';
}

/**
 * Estado de la sesión. La validación de las credenciales la hace
 * `AutenticacionRepositorio` (local o `POST /auth/login`); este servicio solo
 * guarda, expone y cierra la sesión.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _sesion = signal<Sesion | null>(leerSesion());
  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  readonly rol = computed(() => this._sesion()?.rol ?? null);

  abrirSesion(sesion: Sesion, recordar = false): void {
    borrarSesion();
    try {
      (recordar ? localStorage : sessionStorage).setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      // Sin almacenamiento la sesión vive solo en memoria.
    }
    this._sesion.set(sesion);
  }

  /** Cierra SOLO la sesión: los datos locales de los módulos se conservan. */
  cerrarSesion(): void {
    borrarSesion();
    this._sesion.set(null);
  }

  tieneRol(...roles: RolUsuario[]): boolean {
    const rol = this.rol();
    return rol !== null && roles.includes(rol);
  }
}

function leerSesion(): Sesion | null {
  for (const almacen of [sessionStorage, localStorage]) {
    try {
      const guardada = almacen.getItem(CLAVE_SESION);
      if (guardada) {
        const sesion = JSON.parse(guardada) as Sesion;
        if (ROLES_USUARIO.some((r) => r.id === sesion.rol)) return sesion;
      }
    } catch {
      // Almacenamiento no disponible o sesión corrupta: se ignora.
    }
  }
  return null;
}

function borrarSesion(): void {
  for (const almacen of [sessionStorage, localStorage]) {
    try {
      almacen.removeItem(CLAVE_SESION);
    } catch {
      // Nada que borrar.
    }
  }
}
