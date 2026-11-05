import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** La fecha (`YYYY-MM-DD`) no puede ser posterior a hoy. */
export const fechaNoFutura: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null => {
  const valor = control.value;
  if (!valor) {
    return null;
  }
  const hoy = new Date().toISOString().slice(0, 10);
  return valor > hoy ? { fechaFutura: true } : null;
};

/** Mensaje de error para mostrar debajo de un campo, o `null` si no aplica. */
export function mensajeError(control: AbstractControl): string | null {
  if (!control.errors || !(control.touched || control.dirty)) {
    return null;
  }
  const e = control.errors;
  if (e['required']) return 'Este campo es obligatorio.';
  if (e['email']) return 'Ingresa un correo válido.';
  if (e['minlength']) return `Mínimo ${(e['minlength'] as { requiredLength: number }).requiredLength} caracteres.`;
  if (e['maxlength']) return `Máximo ${(e['maxlength'] as { requiredLength: number }).requiredLength} caracteres.`;
  if (e['pattern']) return 'El formato no es válido.';
  if (e['fechaFutura']) return 'La fecha no puede ser futura.';
  return 'Valor no válido.';
}

/** Normaliza texto para búsquedas: minúsculas y sin tildes. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
