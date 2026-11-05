import { DatosAcceso, LONGITUD_MINIMA_CONTRASENA, PATRON_USUARIO, normalizarUsuario } from 'src/app/personas/compartido/acceso';
import { ErrorCrud } from 'src/app/shared/crud/crud';

export { normalizarUsuario } from 'src/app/personas/compartido/acceso';

/**
 * Credenciales del MODO LOCAL (`rutarola.credenciales`: usuario en minúsculas → contraseña y titular).
 * Se guardan APARTE de los registros para que la contraseña nunca aparezca en listados, consultas
 * ni exportaciones, igual que el API, que nunca la devuelve.
 * Solo para la demo en el navegador: el servidor debe guardarlas con hash (bcrypt/argon2).
 */
const CLAVE = 'rutarola.credenciales';

/** Quién es dueño del usuario. El usuario es único entre TODOS los titulares. */
export type Titular = 'EMPLEADO' | 'ACUDIENTE';

interface Credencial {
  contrasena: string;
  titular: Titular;
}

/** Contraseña de los usuarios de los datos de ejemplo (y del administrador local). */
export const CONTRASENA_DEMO = 'rutarola';

/** Administrador del modo local (no hay módulo de usuarios administrativos todavía). */
export const ADMIN_LOCAL = { usuario: 'admin', contrasena: CONTRASENA_DEMO };

function leer(): Record<string, Credencial> {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '{}') as Record<string, Credencial | string>;
    // Versión anterior: solo empleados, con la contraseña como texto.
    return Object.fromEntries(
      Object.entries(guardado).map(([u, c]) => [u, typeof c === 'string' ? { contrasena: c, titular: 'EMPLEADO' } : c]),
    );
  } catch {
    return {};
  }
}

function escribir(credenciales: Record<string, Credencial>): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(credenciales));
  } catch {
    // Sin almacenamiento no se pueden guardar contraseñas en modo local.
  }
}

/** Contraseña del usuario si pertenece a ese titular. */
export function contrasenaDe(usuario: string, titular: Titular): string | null {
  const credencial = leer()[normalizarUsuario(usuario)];
  return credencial?.titular === titular ? credencial.contrasena : null;
}

/**
 * Guarda la contraseña de `usuario`. Si el usuario cambió de nombre, mueve la contraseña
 * anterior. `contrasena` vacía = conservar la actual.
 */
export function guardarCredencial(usuario: string, contrasena: string, titular: Titular, usuarioAnterior = ''): void {
  const credenciales = leer();
  const nuevo = normalizarUsuario(usuario);
  const anterior = normalizarUsuario(usuarioAnterior);
  const actual = (credenciales[anterior] ?? credenciales[nuevo])?.contrasena;
  if (anterior && anterior !== nuevo) delete credenciales[anterior];
  const valor = contrasena || actual;
  if (nuevo && valor) credenciales[nuevo] = { contrasena: valor, titular };
  escribir(credenciales);
}

export function borrarCredencial(usuario: string): void {
  const credenciales = leer();
  delete credenciales[normalizarUsuario(usuario)];
  escribir(credenciales);
}

/**
 * Reglas del acceso (las mismas que debe aplicar el API, 422/409):
 * formato del usuario, único entre todos los titulares (y distinto del administrador)
 * y contraseña obligatoria al crear.
 */
export function validarAcceso<T extends DatosAcceso & { id: string }>(
  datos: DatosAcceso,
  idActual: string | null,
  registros: T[],
  titular: Titular,
): void {
  const usuario = normalizarUsuario(datos.usuario);
  if (!PATRON_USUARIO.test(usuario)) {
    throw new ErrorCrud('El usuario debe tener entre 4 y 40 caracteres, sin espacios.', 'VALIDACION');
  }
  const anterior = idActual ? normalizarUsuario(registros.find((r) => r.id === idActual)?.usuario ?? '') : '';
  const enUso =
    usuario === ADMIN_LOCAL.usuario ||
    registros.some((r) => r.id !== idActual && normalizarUsuario(r.usuario ?? '') === usuario) ||
    (usuario !== anterior && leer()[usuario] !== undefined && leer()[usuario].titular !== titular);
  if (enUso) {
    throw new ErrorCrud(`El usuario "${datos.usuario.trim()}" ya está en uso. Elige otro.`, 'DUPLICADO');
  }
  if ((!idActual || datos.contrasena) && datos.contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    throw new ErrorCrud(`La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`, 'VALIDACION');
  }
}

/**
 * Falla con `DUPLICADO` si otro titular (registros de OTRO módulo) ya usa el usuario. Lo usan
 * `EmpleadosLocal` y `AcudientesLocal` en `validarRelaciones` porque cada uno solo ve sus registros.
 */
export function validarUsuarioLibre(usuario: string, otros: { usuario?: string }[]): void {
  const buscado = normalizarUsuario(usuario);
  if (otros.some((o) => normalizarUsuario(o.usuario ?? '') === buscado)) {
    throw new ErrorCrud(`El usuario "${usuario.trim()}" ya está en uso. Elige otro.`, 'DUPLICADO');
  }
}

/** Guarda la contraseña aparte y devuelve los datos sin ella (el registro nunca la lleva). */
export function prepararAcceso<D extends DatosAcceso, T extends DatosAcceso & { id: string }>(
  datos: D,
  idActual: string | null,
  registros: T[],
  titular: Titular,
): D {
  const anterior = idActual ? (registros.find((r) => r.id === idActual)?.usuario ?? '') : '';
  const usuario = normalizarUsuario(datos.usuario);
  guardarCredencial(usuario, datos.contrasena, titular, anterior);
  return { ...datos, usuario, contrasena: '' };
}

/** Usuario de los datos de ejemplo: inicial del nombre + primer apellido, sin tildes (`jcardenas`). */
export function usuarioDemo(nombre: string, apellido: string): string {
  return `${nombre[0]}${apellido}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s/g, '').toLowerCase();
}
