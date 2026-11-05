import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Credenciales, Sesion } from 'src/app/core/auth';
import { AutenticacionRepositorio } from './autenticacion-repositorio';

/**
 * `POST {apiUrl}/auth/login` `{usuario, contrasena}` → `Sesion` (+ token cuando se defina el
 * esquema de autorización). El SERVIDOR decide el rol:
 * - usuario y contraseña de un empleado activo (definidos en Personas › Empleados) → `rol` igual a su
 *   tipo (CONDUCTOR/MONITORA) y `empleadoId`;
 * - usuario y contraseña de un acudiente activo (Personas › Acudientes) → `ACUDIENTE` y `acudienteId`;
 * - usuario administrativo → `ADMINISTRADOR`, `empleadoId: null`.
 * El usuario es único en todo el sistema (empleados, acudientes y administradores).
 * Credenciales inválidas o usuario inactivo → 401/422 con `{mensaje}`.
 */
@Injectable()
export class AutenticacionHttp extends AutenticacionRepositorio {
  private readonly http = inject(HttpClient);

  iniciarSesion({ usuario, contrasena }: Credenciales): Observable<Sesion> {
    return this.http.post<Sesion>(`${environment.apiUrl}/auth/login`, { usuario: usuario.trim(), contrasena });
  }
}
