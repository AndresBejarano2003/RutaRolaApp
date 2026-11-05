import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { FiltrosRuta, Ruta } from './ruta';
import { RutasRepositorio } from './rutas-repositorio';

/**
 * Conexión al API: `{apiUrl}/rutas` (filtros `texto`, `colegioId`,
 * `jornada`, `estado`, `estudianteId`).
 * Reglas del API: código único; un estudiante solo puede estar en una ruta
 * activa por jornada (409); `DELETE` responde 409 si la ruta tiene asignaciones.
 */
@Injectable()
export class RutasHttp extends RepositorioHttp<Ruta, FiltrosRuta> implements RutasRepositorio {
  protected readonly recurso = 'rutas';
}
