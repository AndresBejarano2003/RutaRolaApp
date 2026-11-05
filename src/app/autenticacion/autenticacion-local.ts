import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { Credenciales, RolUsuario, Sesion, USUARIO_DEMO } from 'src/app/core/auth';
import { nombreCompleto } from 'src/app/personas/compartido/persona';
import { FILTROS_EMPLEADO_VACIOS } from 'src/app/personas/empleados/empleado';
import { EmpleadosRepositorio } from 'src/app/personas/empleados/empleados-repositorio';
import { ErrorCrud } from 'src/app/shared/crud/crud';
import { FuenteLocal, SIN_PAGINAR } from 'src/app/shared/crud/repositorio-local';
import { AutenticacionRepositorio } from './autenticacion-repositorio';
import { ADMIN_LOCAL, contrasenaDe, normalizarUsuario } from './credenciales-local';

export const MENSAJE_CREDENCIALES_INVALIDAS = 'Usuario o contraseña incorrectos.';

/**
 * Login TEMPORAL mientras no existe el API:
 * - Usuario y contraseña de un empleado (Personas › Empleados) → CONDUCTOR o MONITORA según su tipo.
 *   Si el empleado está inactivo no puede entrar.
 * - `ADMIN_LOCAL` → ADMINISTRADOR con el perfil de ejemplo `USUARIO_DEMO`.
 * El mensaje de error no revela si lo que falló fue el usuario o la contraseña.
 */
@Injectable()
export class AutenticacionLocal extends AutenticacionRepositorio implements FuenteLocal {
  readonly modoLocal = true as const;
  private readonly empleados = inject(EmpleadosRepositorio);

  iniciarSesion({ usuario, contrasena }: Credenciales): Observable<Sesion> {
    const limpio = normalizarUsuario(usuario);
    if (!limpio || !contrasena) {
      return throwError(() => new ErrorCrud('Ingresa tu usuario y tu contraseña.', 'VALIDACION'));
    }
    const sesion = (rol: RolUsuario, nombre: string, correo: string, empleadoId: string | null, imagen = ''): Sesion => ({
      usuario: limpio,
      nombre,
      correo,
      rol,
      empleadoId,
      imagen,
      inicio: new Date().toISOString(),
    });

    return this.empleados.listar(FILTROS_EMPLEADO_VACIOS, SIN_PAGINAR).pipe(
      map(({ items }) => {
        if (limpio === ADMIN_LOCAL.usuario) {
          if (contrasena !== ADMIN_LOCAL.contrasena) throw new ErrorCrud(MENSAJE_CREDENCIALES_INVALIDAS, 'VALIDACION');
          return sesion('ADMINISTRADOR', USUARIO_DEMO.nombre, USUARIO_DEMO.correo, null, USUARIO_DEMO.imagen);
        }
        const empleado = items.find((e) => normalizarUsuario(e.usuario ?? '') === limpio);
        if (!empleado || contrasenaDe(limpio) !== contrasena) {
          throw new ErrorCrud(MENSAJE_CREDENCIALES_INVALIDAS, 'VALIDACION');
        }
        if (empleado.estado !== 'ACTIVO') {
          throw new ErrorCrud('Tu usuario está inactivo. Comunícate con el administrador.', 'VALIDACION');
        }
        return sesion(empleado.tipoEmpleado, nombreCompleto(empleado), empleado.correo, empleado.id);
      }),
    );
  }
}
