import { Injectable, computed, signal } from '@angular/core';

export interface OpcionCatalogo {
  id: string;
  nombre: string;
}

const opciones = (nombres: string[]): OpcionCatalogo[] => nombres.map((nombre) => ({ id: nombre, nombre }));

/**
 * Listas para los `<select>`. Las fijas (tipos de documento, grados,
 * jornadas) pueden quedarse aquí; colegios y acudientes son TEMPORALES y
 * deben venir del API de sus módulos cuando existan.
 */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  readonly tiposDocumento: OpcionCatalogo[] = [
    { id: 'RC', nombre: 'Registro civil' },
    { id: 'TI', nombre: 'Tarjeta de identidad' },
    { id: 'CC', nombre: 'Cédula de ciudadanía' },
    { id: 'CE', nombre: 'Cédula de extranjería' },
    { id: 'PPT', nombre: 'Permiso por protección temporal' },
    { id: 'PA', nombre: 'Pasaporte' },
  ];

  readonly grados: OpcionCatalogo[] = opciones([
    'Prejardín', 'Jardín', 'Transición', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°',
  ]);

  readonly jornadas: OpcionCatalogo[] = opciones(['Mañana', 'Tarde', 'Única']);

  // TODO: cargar desde GET /colegios cuando exista el API.
  readonly colegios = signal<OpcionCatalogo[]>([
    { id: 'col-1', nombre: 'Colegio San Cayetano' },
    { id: 'col-2', nombre: 'Colegio Matre Paula' },
    { id: 'col-3', nombre: 'Colegio La Gaitana' },
    { id: 'col-4', nombre: 'Colegio Enrique Olaya Herrera' },
    { id: 'col-5', nombre: 'Colegio San José' },
  ]);

  // TODO: cargar desde GET /acudientes cuando exista el API.
  readonly acudientes = signal<OpcionCatalogo[]>([
    { id: 'acu-1', nombre: 'María Pérez' },
    { id: 'acu-2', nombre: 'Carlos Rodríguez' },
    { id: 'acu-3', nombre: 'Luz Marina Gómez' },
    { id: 'acu-4', nombre: 'Jorge Martínez' },
    { id: 'acu-5', nombre: 'Andrea Castillo' },
    { id: 'acu-6', nombre: 'Fernando Ríos' },
  ]);

  readonly nombresColegio = computed(() => aMapa(this.colegios()));
  readonly nombresAcudiente = computed(() => aMapa(this.acudientes()));
  readonly nombresTipoDocumento = aMapa(this.tiposDocumento);
}

function aMapa(lista: OpcionCatalogo[]): ReadonlyMap<string, string> {
  return new Map(lista.map((o) => [o.id, o.nombre]));
}
