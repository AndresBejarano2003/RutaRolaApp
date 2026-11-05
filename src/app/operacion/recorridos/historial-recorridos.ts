import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { EstadoRecorrido, Recorrido, Trayecto } from 'src/app/ruta-del-dia/recorrido';

export type NovedadRecorrido = 'AUSENCIAS' | 'OBSERVACIONES';

export interface FiltrosRecorrido {
  /** Busca en ruta, colegio, vehículo, conductor, monitora y estudiantes. */
  texto: string;
  /** `YYYY-MM-DD`, inclusive. */
  desde: string;
  hasta: string;
  rutaId: string;
  trayecto: Trayecto | '';
  estado: EstadoRecorrido | '';
  novedad: NovedadRecorrido | '';
}

export const FILTROS_RECORRIDO_VACIOS: FiltrosRecorrido = {
  texto: '', desde: '', hasta: '', rutaId: '', trayecto: '', estado: '', novedad: '',
};

export const ESTADOS_RECORRIDO: { id: EstadoRecorrido; nombre: string }[] = [
  { id: 'EN_CURSO', nombre: 'En curso' },
  { id: 'FINALIZADO', nombre: 'Finalizado' },
];

export const NOVEDADES_RECORRIDO: OpcionCatalogo[] = [
  { id: 'AUSENCIAS', nombre: 'Con estudiantes que no asistieron' },
  { id: 'OBSERVACIONES', nombre: 'Con observaciones' },
];

export function tieneNovedad(r: Recorrido, novedad: NovedadRecorrido | ''): boolean {
  if (novedad === 'AUSENCIAS') return r.paradas.some((p) => p.estado === 'AUSENTE');
  if (novedad === 'OBSERVACIONES') return !!r.observaciones.trim();
  return true;
}

/** Minutos entre el inicio y el fin (o `ahora` si sigue en curso). */
export function duracionMinutos(r: Pick<Recorrido, 'inicio' | 'fin'>, ahora = new Date()): number {
  const fin = r.fin ? new Date(r.fin) : ahora;
  return Math.max(0, Math.round((fin.getTime() - new Date(r.inicio).getTime()) / 60_000));
}

/** `75` → `1 h 15 min`. */
export function textoDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}
