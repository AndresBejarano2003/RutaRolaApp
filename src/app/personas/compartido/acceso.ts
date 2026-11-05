import { AbstractControl, NonNullableFormBuilder, ValidationErrors, Validators } from '@angular/forms';

/**
 * Credenciales con que una persona (empleado o acudiente) ingresa a SU app.
 * - `usuario`: único en TODO el sistema (empleados, acudientes y administradores), 4–40 caracteres
 *   sin espacios; se guarda en minúsculas. Puede ser correo, documento u otro texto.
 * - `contrasena`: SOLO ESCRITURA. Obligatoria al crear; vacía al editar = conservar la actual.
 *   El API nunca la devuelve (llega vacía) y la guarda con hash.
 */
export interface DatosAcceso {
  usuario: string;
  contrasena: string;
}

export const PATRON_USUARIO = /^\S{4,40}$/;
export const LONGITUD_MINIMA_CONTRASENA = 6;
export const LONGITUD_MAXIMA_CONTRASENA = 64;

/** Controles de `<app-campos-acceso>`; `confirmarContrasena` no se envía. */
export function controlesAcceso(fb: NonNullableFormBuilder) {
  return {
    usuario: fb.control('', [Validators.required, Validators.pattern(PATRON_USUARIO)]),
    contrasena: fb.control(''),
    confirmarContrasena: fb.control(''),
  };
}

/** Contraseña obligatoria solo al crear. Llamar cuando cambie el modo del formulario. */
export function ajustarContrasena(form: AbstractControl, crear: boolean): void {
  const control = form.get('contrasena');
  if (!control) return;
  const longitud = [Validators.minLength(LONGITUD_MINIMA_CONTRASENA), Validators.maxLength(LONGITUD_MAXIMA_CONTRASENA)];
  control.setValidators(crear ? [Validators.required, ...longitud] : longitud);
  control.updateValueAndValidity({ emitEvent: false });
}

/** Validador de grupo: "Confirmar contraseña" debe coincidir (marca `noCoincide` en ese control). */
export function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
  const contrasena = grupo.get('contrasena');
  const confirmar = grupo.get('confirmarContrasena');
  if (!contrasena || !confirmar) return null;
  const distintas = !!contrasena.value && contrasena.value !== confirmar.value;
  const { noCoincide: _anterior, ...otros } = confirmar.errors ?? {};
  confirmar.setErrors(distintas ? { ...otros, noCoincide: true } : Object.keys(otros).length ? otros : null);
  return null;
}

/** Usuario normalizado para guardar y comparar. */
export function normalizarUsuario(usuario: string): string {
  return usuario.trim().toLowerCase();
}
