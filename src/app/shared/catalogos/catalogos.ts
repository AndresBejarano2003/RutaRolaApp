import { Injectable } from '@angular/core';

export interface OpcionCatalogo {
  id: string;
  nombre: string;
}

/** Grados escolares en orden, de Jardín a Once (el id es el valor guardado). */
export const GRADOS: OpcionCatalogo[] = [
  { id: 'Jardín', nombre: 'Jardín' },
  { id: 'Transición', nombre: 'Transición' },
  ...['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Once'].map(
    (nombre, i) => ({ id: `${i + 1}°`, nombre: `${i + 1}° · ${nombre}` }),
  ),
];

/** Posición del grado en `GRADOS` (para ordenar cursos). */
export function ordenGrado(grado: string): number {
  return GRADOS.findIndex((g) => g.id === grado);
}

/**
 * Listas FIJAS para `<app-selector-busqueda>` (tipos de documento, grados,
 * jornadas). Las listas de registros de otras pantallas (colegios,
 * acudientes, vehículos...) NO van aquí: se piden a su repositorio con
 * `opciones()`.
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

  readonly grados = GRADOS;
  readonly jornadas: OpcionCatalogo[] = ['Mañana', 'Tarde', 'Única'].map((nombre) => ({ id: nombre, nombre }));
  readonly nombresTipoDocumento = aMapa(this.tiposDocumento);
}

export function aMapa(lista: OpcionCatalogo[]): ReadonlyMap<string, string> {
  return new Map(lista.map((o) => [o.id, o.nombre]));
}
