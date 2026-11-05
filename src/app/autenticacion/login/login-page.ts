import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Credenciales } from 'src/app/core/auth';

const DURACION_EXITO_MS = 500;
const DURACION_ERROR_MS = 4000;

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export default class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly anioActual = new Date().getFullYear();
  protected readonly mostrarExito = signal(false);
  protected readonly mostrarError = signal(false);
  protected readonly mostrarContrasena = signal(false);

  protected iniciarSesion(credenciales: Partial<Credenciales>): void {
    const valido = this.auth.iniciarSesion({
      usuario: credenciales.usuario ?? '',
      contrasena: credenciales.contrasena ?? '',
    });

    this.mostrarError.set(!valido);
    this.mostrarExito.set(valido);

    if (valido) {
      setTimeout(() => {
        this.mostrarExito.set(false);
        this.router.navigate(['/inicio']);
      }, DURACION_EXITO_MS);
    } else {
      setTimeout(() => this.mostrarError.set(false), DURACION_ERROR_MS);
    }
  }

  protected alternarContrasena(): void {
    this.mostrarContrasena.update((visible) => !visible);
  }
}
