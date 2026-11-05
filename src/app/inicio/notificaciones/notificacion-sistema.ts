import { Entidad } from 'src/app/shared/crud/crud';
import { fechaIso } from 'src/app/shared/fechas/fechas';

/**
 * Notificación del sistema (bandeja de la campana). Las genera el SERVIDOR:
 * - por evento: pago recibido, factura/cotización/vehículo/empleado registrado, envío realizado o fallido;
 * - por un proceso diario: documentos y licencias por vencer o vencidos, contratos por terminar o
 *   terminados y acudientes en mora.
 * El usuario solo las lee, archiva o elimina.
 */
export interface NotificacionSistema extends Entidad {
  /**
   * Identifica el hecho notificado (p. ej. `veh-doc:{id}:SOAT:{fecha}:VENCIDA`). Un mismo hecho se
   * notifica UNA sola vez, aunque el usuario elimine la notificación.
   */
  clave: string;
  categoria: CategoriaNotificacion;
  nivel: NivelNotificacion;
  titulo: string;
  /** Texto completo (se ve al expandir). */
  mensaje: string;
  /** ISO 8601: cuándo ocurrió o se detectó. */
  fecha: string;
  leida: boolean;
  archivada: boolean;
  /** Pantalla relacionada (ruta del menú) o `null`. */
  enlace: string | null;
  textoEnlace: string;
}

/** Datos que produce el generador; el resto (id, lectura, archivo) lo completa quien la guarda. */
export type NuevaNotificacion = Omit<NotificacionSistema, 'id' | 'leida' | 'archivada' | 'fecha'> & { fecha?: string };

export type CategoriaNotificacion =
  | 'PAGOS'
  | 'FACTURACION'
  | 'COTIZACIONES'
  | 'VENCIMIENTOS'
  | 'OPERACION'
  | 'PERSONAS'
  | 'ENVIOS'
  | 'SISTEMA';

export type NivelNotificacion = 'CRITICA' | 'ADVERTENCIA' | 'INFORMATIVA' | 'EXITO';

export type BandejaNotificaciones = 'ENTRADA' | 'ARCHIVADAS';

export const CATEGORIAS_NOTIFICACION: { id: CategoriaNotificacion; nombre: string; icono: string }[] = [
  { id: 'PAGOS', nombre: 'Pagos y cartera', icono: 'fa-solid fa-money-bill-wave' },
  { id: 'FACTURACION', nombre: 'Facturas y contratos', icono: 'fa-solid fa-file-invoice-dollar' },
  { id: 'COTIZACIONES', nombre: 'Cotizaciones', icono: 'fa-solid fa-file-lines' },
  { id: 'VENCIMIENTOS', nombre: 'Vencimientos', icono: 'fa-solid fa-calendar-xmark' },
  { id: 'OPERACION', nombre: 'Operación', icono: 'fa-solid fa-bus' },
  { id: 'PERSONAS', nombre: 'Personas', icono: 'fa-solid fa-user-plus' },
  { id: 'ENVIOS', nombre: 'Envíos', icono: 'fa-solid fa-paper-plane' },
  { id: 'SISTEMA', nombre: 'Sistema', icono: 'fa-solid fa-gear' },
];

/** Colores del ícono y del badge por nivel (tokens del tema, contraste AA sobre base-100/200). */
export const NIVELES_NOTIFICACION: { id: NivelNotificacion; nombre: string; icono: string; texto: string; fondo: string; badge: string }[] = [
  { id: 'CRITICA', nombre: 'Crítica', icono: 'fa-solid fa-circle-exclamation', texto: 'text-error', fondo: 'bg-error/15', badge: 'badge-error' },
  { id: 'ADVERTENCIA', nombre: 'Advertencia', icono: 'fa-solid fa-triangle-exclamation', texto: 'text-warning', fondo: 'bg-warning/15', badge: 'badge-warning' },
  { id: 'INFORMATIVA', nombre: 'Informativa', icono: 'fa-solid fa-circle-info', texto: 'text-info', fondo: 'bg-info/15', badge: 'badge-info' },
  { id: 'EXITO', nombre: 'Éxito', icono: 'fa-solid fa-circle-check', texto: 'text-success', fondo: 'bg-success/15', badge: 'badge-success' },
];

export const ESTADOS_LECTURA = [
  { id: 'NO_LEIDAS', nombre: 'No leídas' },
  { id: 'LEIDAS', nombre: 'Leídas' },
];

export interface FiltrosNotificacion {
  bandeja: BandejaNotificaciones;
  texto: string;
  categoria: CategoriaNotificacion | '';
  nivel: NivelNotificacion | '';
  lectura: 'NO_LEIDAS' | 'LEIDAS' | '';
}

export const FILTROS_NOTIFICACION_VACIOS: FiltrosNotificacion = {
  bandeja: 'ENTRADA',
  texto: '',
  categoria: '',
  nivel: '',
  lectura: '',
};

/** Lo que muestra la campana. */
export interface ResumenNotificaciones {
  /** No leídas de la bandeja de entrada. */
  noLeidas: number;
  /** No leídas de nivel crítico (la campana se pone roja). */
  criticas: number;
  /** Las más recientes de la bandeja de entrada. */
  recientes: NotificacionSistema[];
}

export const RESUMEN_VACIO: ResumenNotificaciones = { noLeidas: 0, criticas: 0, recientes: [] };

/** Cuántas recientes muestra la campana. */
export const RECIENTES_CAMPANA = 6;

export function categoria(id: CategoriaNotificacion) {
  return CATEGORIAS_NOTIFICACION.find((c) => c.id === id) ?? CATEGORIAS_NOTIFICACION[CATEGORIAS_NOTIFICACION.length - 1];
}

export function nivel(id: NivelNotificacion) {
  return NIVELES_NOTIFICACION.find((n) => n.id === id) ?? NIVELES_NOTIFICACION[2];
}

/** `Ahora`, `Hace 5 min`, `Hace 3 h`, `Ayer`, `Hace 4 días` o la fecha. */
export function tiempoRelativo(iso: string, ahora = new Date()): string {
  const fecha = new Date(iso);
  const minutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60_000);
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = diasCalendario(fecha, ahora);
  if (dias <= 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    ...(fecha.getFullYear() !== ahora.getFullYear() ? { year: 'numeric' } : {}),
  });
}

export type GrupoFecha = 'Hoy' | 'Ayer' | 'Últimos 7 días' | 'Anteriores';

/** Grupo de la lista según el día calendario local. */
export function grupoFecha(iso: string, ahora = new Date()): GrupoFecha {
  const dias = diasCalendario(new Date(iso), ahora);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 7) return 'Últimos 7 días';
  return 'Anteriores';
}

function diasCalendario(fecha: Date, ahora: Date): number {
  const a = new Date(`${fechaIso(fecha)}T00:00:00`);
  const b = new Date(`${fechaIso(ahora)}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
