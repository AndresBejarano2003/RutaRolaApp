import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService, nombreRol } from 'src/app/core/auth';
import { contrasenasIguales } from 'src/app/personas/compartido/acceso';
import { Campo } from 'src/app/shared/campo/campo';
import { mensajeDeError } from 'src/app/shared/crud/crud';
import { esFuenteLocal } from 'src/app/shared/crud/repositorio-local';
import { mensajeError } from 'src/app/shared/formularios/formularios';
import { NotificacionesService } from 'src/app/shared/notificaciones/notificaciones';
import { AutenticacionRepositorio } from '../autenticacion-repositorio';

/**
 * "Mi cuenta" de cualquier tipo de usuario (administrador, conductor/monitora, acudiente): datos de la
 * sesión y cambio de contraseña. Con el API, cambiarla cierra las sesiones de los otros dispositivos.
 * Los datos personales los edita el administrador en Personas (empleados y acudientes).
 */
@Component({
  selector: 'app-cuenta-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Campo],
  templateUrl: './cuenta-page.html',
})
export default class CuentaPage {
  private readonly repositorio = inject(AutenticacionRepositorio);
  private readonly avisos = inject(NotificacionesService);
  protected readonly sesion = inject(AuthService).sesion;
  protected readonly modoLocal = esFuenteLocal(this.repositorio);

  protected readonly rol = computed(() => {
    const s = this.sesion();
    return s ? nombreRol(s.rol) : '';
  });
  protected readonly inicio = computed(() => {
    const s = this.sesion();
    return s ? new Date(s.inicio).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' }) : '';
  });
  protected readonly guardando = signal(false);
  protected readonly visible = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      actual: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(200)]],
      confirmarContrasena: ['', Validators.required],
    },
    { validators: contrasenasIguales },
  );

  protected error(campo: 'actual' | 'contrasena' | 'confirmarContrasena'): string | null {
    const control = this.form.controls[campo];
    if (control.hasError('noCoincide') && (control.touched || control.dirty)) return 'Las contraseñas no coinciden.';
    return mensajeError(control);
  }

  protected async cambiar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { actual, contrasena } = this.form.getRawValue();
    this.guardando.set(true);
    try {
      await firstValueFrom(this.repositorio.cambiarContrasena(actual, contrasena), { defaultValue: undefined });
      this.form.reset();
      this.avisos.exito(this.modoLocal ? 'Contraseña actualizada.' : 'Contraseña actualizada. Se cerró la sesión en tus otros dispositivos.');
    } catch (e) {
      this.avisos.error(mensajeDeError(e));
    } finally {
      this.guardando.set(false);
    }
  }
}
