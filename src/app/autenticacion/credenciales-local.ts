/**
 * Contraseñas del MODO LOCAL (`rutarola.credenciales`: usuario en minúsculas → contraseña).
 * Se guardan APARTE de los registros para que nunca aparezcan en listados, consultas ni
 * exportaciones, igual que el API, que nunca devuelve la contraseña.
 * Solo para la demo en el navegador: el servidor debe guardarlas con hash (bcrypt/argon2).
 */
const CLAVE = 'rutarola.credenciales';

/** Contraseña de los usuarios de los datos de ejemplo (y del administrador local). */
export const CONTRASENA_DEMO = 'rutarola';

/** Administrador del modo local (no hay módulo de usuarios administrativos todavía). */
export const ADMIN_LOCAL = { usuario: 'admin', contrasena: CONTRASENA_DEMO };

export function normalizarUsuario(usuario: string): string {
  return usuario.trim().toLowerCase();
}

function leer(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function escribir(credenciales: Record<string, string>): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(credenciales));
  } catch {
    // Sin almacenamiento no se pueden guardar contraseñas en modo local.
  }
}

export function contrasenaDe(usuario: string): string | null {
  return leer()[normalizarUsuario(usuario)] ?? null;
}

/**
 * Guarda la contraseña de `usuario`. Si el usuario cambió de nombre, mueve la contraseña
 * anterior. `contrasena` vacía = conservar la actual.
 */
export function guardarCredencial(usuario: string, contrasena: string, usuarioAnterior = ''): void {
  const credenciales = leer();
  const nuevo = normalizarUsuario(usuario);
  const anterior = normalizarUsuario(usuarioAnterior);
  const actual = credenciales[anterior] ?? credenciales[nuevo];
  if (anterior && anterior !== nuevo) delete credenciales[anterior];
  const valor = contrasena || actual;
  if (nuevo && valor) credenciales[nuevo] = valor;
  escribir(credenciales);
}
