import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { siguienteConsecutivo } from 'src/app/shared/crud/crud';
import { LATENCIA_LOCAL, responderLocal } from 'src/app/shared/crud/repositorio-local';
import { ArchivoAdjunto } from 'src/app/shared/archivo-adjunto/archivo-adjunto';

export type TipoSolicitud = 'ERROR' | 'CONSULTA' | 'MEJORA' | 'CAPACITACION';
export type PrioridadSolicitud = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoSolicitud = 'ABIERTA' | 'RESUELTA';

export interface OpcionTipoSolicitud {
  id: TipoSolicitud;
  nombre: string;
  descripcion: string;
  icono: string;
  /** Guía que se muestra en la descripción según el tipo. */
  guia: string;
}

export const TIPOS_SOLICITUD: OpcionTipoSolicitud[] = [
  {
    id: 'ERROR',
    nombre: 'Reportar un error',
    descripcion: 'Algo no funciona como debería.',
    icono: 'fa-solid fa-bug',
    guia: '¿Qué estabas haciendo?, ¿qué esperabas que pasara? y ¿qué pasó en cambio? Incluye el mensaje de error si apareció.',
  },
  {
    id: 'CONSULTA',
    nombre: 'Hacer una consulta',
    descripcion: 'Tengo una duda sobre cómo usar el sistema.',
    icono: 'fa-solid fa-circle-question',
    guia: 'Cuéntanos qué quieres lograr y en qué pantalla estás.',
  },
  {
    id: 'MEJORA',
    nombre: 'Sugerir una mejora',
    descripcion: 'Una idea para que RutaRola sea mejor.',
    icono: 'fa-solid fa-lightbulb',
    guia: 'Describe la mejora y cómo te ayudaría en tu trabajo diario.',
  },
  {
    id: 'CAPACITACION',
    nombre: 'Pedir capacitación',
    descripcion: 'Quiero una sesión guiada para mi equipo.',
    icono: 'fa-solid fa-chalkboard-user',
    guia: 'Indica los temas, cuántas personas asistirían y en qué horario les queda mejor.',
  },
];

export const PRIORIDADES_SOLICITUD: { id: PrioridadSolicitud; nombre: string; descripcion: string }[] = [
  { id: 'BAJA', nombre: 'Baja', descripcion: 'Puede esperar' },
  { id: 'MEDIA', nombre: 'Media', descripcion: 'Afecta mi trabajo' },
  { id: 'ALTA', nombre: 'Alta', descripcion: 'No puedo operar' },
];

export interface DatosSolicitud {
  tipo: TipoSolicitud;
  modulo: string;
  prioridad: PrioridadSolicitud;
  asunto: string;
  descripcion: string;
  adjuntos: ArchivoAdjunto[];
}

export interface SolicitudSoporte extends Omit<DatosSolicitud, 'adjuntos'> {
  /** Consecutivo `SOP-0001`, lo asigna el servidor. */
  numero: string;
  /** ISO 8601. */
  fecha: string;
  estado: EstadoSolicitud;
  /** Localmente solo se guardan los nombres (los archivos los recibirá el API). */
  adjuntos: string[];
}

const CLAVE = 'rutarola.soporte.solicitudes';

/**
 * Solicitudes de soporte del usuario. TEMPORAL: se guardan en `localStorage`
 * hasta que exista el API de soporte (pendiente en el README).
 */
@Injectable({ providedIn: 'root' })
export class SolicitudesSoporteService {
  readonly modoLocal = true;
  private readonly latenciaMs = inject(LATENCIA_LOCAL);

  private readonly _lista = signal<SolicitudSoporte[]>(this.leer());
  /** Más recientes primero. */
  readonly lista = this._lista.asReadonly();
  readonly abiertas = computed(() => this._lista().filter((s) => s.estado === 'ABIERTA').length);
  readonly enviando = signal(false);

  async enviar(datos: DatosSolicitud): Promise<SolicitudSoporte> {
    this.enviando.set(true);
    try {
      const solicitud = await firstValueFrom(
        responderLocal(
          (): SolicitudSoporte => ({
            ...datos,
            asunto: datos.asunto.trim(),
            descripcion: datos.descripcion.trim(),
            adjuntos: datos.adjuntos.map((a) => a.nombre),
            numero: siguienteConsecutivo('SOP', this._lista().map((s) => s.numero)),
            fecha: new Date().toISOString(),
            estado: 'ABIERTA',
          }),
          this.latenciaMs,
        ),
      );
      // Se guarda al "responder el servidor", no antes, para que la lista y el botón cambien a la vez.
      const lista = [solicitud, ...this._lista()];
      localStorage.setItem(CLAVE, JSON.stringify(lista));
      this._lista.set(lista);
      return solicitud;
    } finally {
      this.enviando.set(false);
    }
  }

  private leer(): SolicitudSoporte[] {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) ?? '[]') as SolicitudSoporte[];
    } catch {
      return [];
    }
  }
}
