import { Entidad } from 'src/app/shared/crud/crud';

/**
 * Sentido del recorrido:
 * - `RECOGIDA`: casa → colegio. Se recoge a cada estudiante en su casa y se entregan todos en el colegio.
 * - `ENTREGA`: colegio → casa. Abordan en el colegio y se entrega cada uno en su casa (orden inverso).
 */
export type Trayecto = 'RECOGIDA' | 'ENTREGA';

export const TRAYECTOS: { id: Trayecto; nombre: string; descripcion: string; icono: string }[] = [
  { id: 'RECOGIDA', nombre: 'Recogida', descripcion: 'De la casa al colegio', icono: 'fa-solid fa-house-chimney-user' },
  { id: 'ENTREGA', nombre: 'Entrega', descripcion: 'Del colegio a la casa', icono: 'fa-solid fa-school' },
];

/** PENDIENTE → A_BORDO → ENTREGADO, o PENDIENTE → AUSENTE. */
export type EstadoParada = 'PENDIENTE' | 'A_BORDO' | 'ENTREGADO' | 'AUSENTE';

export const ESTADOS_PARADA: Record<EstadoParada, { nombre: string; badge: string; icono: string }> = {
  PENDIENTE: { nombre: 'Pendiente', badge: 'bg-base-300 text-base-content', icono: 'fa-solid fa-clock' },
  A_BORDO: { nombre: 'A bordo', badge: 'badge-soft badge-info', icono: 'fa-solid fa-bus' },
  ENTREGADO: { nombre: 'Entregado', badge: 'badge-soft badge-success', icono: 'fa-solid fa-circle-check' },
  AUSENTE: { nombre: 'No asistió', badge: 'badge-soft badge-warning', icono: 'fa-solid fa-user-slash' },
};

/** Cambios permitidos (incluye "deshacer" hacia el estado anterior). */
const TRANSICIONES: Record<EstadoParada, EstadoParada[]> = {
  PENDIENTE: ['A_BORDO', 'AUSENTE'],
  A_BORDO: ['ENTREGADO', 'PENDIENTE'],
  ENTREGADO: ['A_BORDO'],
  AUSENTE: ['PENDIENTE'],
};

export function transicionPermitida(desde: EstadoParada, hacia: EstadoParada): boolean {
  return TRANSICIONES[desde].includes(hacia);
}

/** Estudiante del recorrido. Guarda los datos COMO ESTABAN al iniciar (snapshot). */
export interface Parada {
  estudianteId: string;
  estudiante: string;
  grado: string;
  direccion: string;
  acudiente: string;
  telefonoAcudiente: string;
  estado: EstadoParada;
  /** ISO de cuando subió al vehículo. */
  horaAbordo: string | null;
  /** ISO de cuando se entregó (colegio en recogida, casa en entrega). */
  horaEntrega: string | null;
}

export type EstadoRecorrido = 'EN_CURSO' | 'FINALIZADO';

export interface Recorrido extends Entidad {
  asignacionId: string;
  rutaId: string;
  /** `YYYY-MM-DD` */
  fecha: string;
  trayecto: Trayecto;
  estado: EstadoRecorrido;
  // Snapshot de la asignación al iniciar
  ruta: string;
  jornada: string;
  colegio: string;
  direccionColegio: string;
  vehiculo: string;
  conductorId: string;
  conductor: string;
  monitoraId: string;
  monitora: string;
  /** En el orden en que se visitan. */
  paradas: Parada[];
  /** ISO */
  inicio: string;
  fin: string | null;
  /** Empleado que inició el recorrido. */
  iniciadoPor: string;
  observaciones: string;
}

export interface ConteoParadas {
  total: number;
  pendientes: number;
  aBordo: number;
  entregados: number;
  ausentes: number;
}

export interface ResumenRecorrido {
  id: string;
  trayecto: Trayecto;
  estado: EstadoRecorrido;
  inicio: string;
  fin: string | null;
  conteo: ConteoParadas;
}

/** Ruta que el empleado autenticado cubre hoy (asignación activa vigente en la fecha). */
export interface RutaAsignada {
  asignacionId: string;
  rutaId: string;
  ruta: string;
  jornada: string;
  sector: string;
  colegio: string;
  direccionColegio: string;
  vehiculo: string;
  /** Rol del empleado en esta ruta. */
  rol: 'CONDUCTOR' | 'MONITORA';
  /** La otra persona del vehículo (monitora del conductor o viceversa). */
  companero: { nombre: string; telefono: string; rol: 'CONDUCTOR' | 'MONITORA' } | null;
  estudiantes: number;
  /** Recorridos de la fecha consultada. */
  recorridos: ResumenRecorrido[];
}

export function contarParadas(paradas: Parada[]): ConteoParadas {
  const de = (estado: EstadoParada) => paradas.filter((p) => p.estado === estado).length;
  return {
    total: paradas.length,
    pendientes: de('PENDIENTE'),
    aBordo: de('A_BORDO'),
    entregados: de('ENTREGADO'),
    ausentes: de('AUSENTE'),
  };
}

export function resumirRecorrido(r: Recorrido): ResumenRecorrido {
  return { id: r.id, trayecto: r.trayecto, estado: r.estado, inicio: r.inicio, fin: r.fin, conteo: contarParadas(r.paradas) };
}

/** Porcentaje de estudiantes con su situación resuelta (entregado o ausente). */
export function avance(conteo: ConteoParadas): number {
  return conteo.total ? Math.round(((conteo.entregados + conteo.ausentes) / conteo.total) * 100) : 100;
}

/** Orden de visita: la entrega recorre la ruta al revés que la recogida. */
export function ordenarParadas<T>(estudiantesEnOrdenDeRuta: T[], trayecto: Trayecto): T[] {
  return trayecto === 'RECOGIDA' ? [...estudiantesEnOrdenDeRuta] : [...estudiantesEnOrdenDeRuta].reverse();
}

/**
 * Qué toca hacer ahora:
 * - RECOGIDA: recoger al siguiente PENDIENTE; sin pendientes y con alguien a bordo → llegar al colegio.
 * - ENTREGA: primero el abordaje en el colegio (PENDIENTE); luego entregar al siguiente A_BORDO.
 * - Todos resueltos → finalizar.
 */
export type PasoRecorrido =
  | { tipo: 'RECOGER'; parada: Parada }
  | { tipo: 'LLEGADA_COLEGIO'; aBordo: number }
  | { tipo: 'ABORDAJE'; pendientes: Parada[] }
  | { tipo: 'ENTREGAR'; parada: Parada }
  | { tipo: 'FINALIZAR' };

export function siguientePaso(r: Pick<Recorrido, 'trayecto' | 'paradas'>): PasoRecorrido {
  const pendientes = r.paradas.filter((p) => p.estado === 'PENDIENTE');
  const aBordo = r.paradas.filter((p) => p.estado === 'A_BORDO');
  if (r.trayecto === 'RECOGIDA') {
    if (pendientes.length) return { tipo: 'RECOGER', parada: pendientes[0] };
    if (aBordo.length) return { tipo: 'LLEGADA_COLEGIO', aBordo: aBordo.length };
  } else {
    if (pendientes.length) return { tipo: 'ABORDAJE', pendientes };
    if (aBordo.length) return { tipo: 'ENTREGAR', parada: aBordo[0] };
  }
  return { tipo: 'FINALIZAR' };
}

/** Un recorrido solo se finaliza con TODOS entregados o ausentes: nadie puede quedar a bordo. */
export function motivoNoFinalizar(paradas: Parada[]): string | null {
  const { aBordo, pendientes } = contarParadas(paradas);
  if (aBordo) {
    return `${aBordo === 1 ? 'Hay 1 estudiante' : `Hay ${aBordo} estudiantes`} a bordo. Ningún estudiante puede quedar en el vehículo: márcalo como entregado.`;
  }
  if (pendientes) {
    return `${pendientes === 1 ? 'Falta 1 estudiante' : `Faltan ${pendientes} estudiantes`} por marcar como recogido o "No asistió".`;
  }
  return null;
}

/** Aplica un cambio de estado con su hora. Lanza `Error` si la transición no está permitida. */
export function cambiarEstado(parada: Parada, estado: EstadoParada, ahora: string): Parada {
  if (parada.estado === estado) return parada;
  if (!transicionPermitida(parada.estado, estado)) {
    throw new Error(`${parada.estudiante}: no se puede pasar de "${ESTADOS_PARADA[parada.estado].nombre}" a "${ESTADOS_PARADA[estado].nombre}".`);
  }
  switch (estado) {
    case 'A_BORDO':
      return { ...parada, estado, horaAbordo: parada.estado === 'ENTREGADO' ? parada.horaAbordo : ahora, horaEntrega: null };
    case 'ENTREGADO':
      return { ...parada, estado, horaEntrega: ahora };
    default:
      return { ...parada, estado, horaAbordo: null, horaEntrega: null };
  }
}

/** Enlace de navegación (Google Maps) a una dirección de la ciudad. */
export function enlaceMapa(direccion: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

/** Enlace `wa.me` con mensaje (Colombia +57 si el número no trae indicativo). */
export function enlaceWhatsapp(telefono: string, mensaje: string): string {
  const digitos = telefono.replace(/\D/g, '');
  const numero = digitos.length === 10 ? `57${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
