import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { Estudiante, FiltrosEstudiante } from './estudiante';
import { EstudiantesRepositorio } from './estudiantes-repositorio';

/**
 * Conexión al API: `{apiUrl}/estudiantes`. Filtros enviados como query
 * params: `texto`, `acudienteId`, `colegioId`, `grado`, `estado`, `pagina`, `tamano`.
 * Reglas del API: documento único (409); colegio y acudiente de la misma empresa (404); el grado
 * debe ser un curso activo del colegio (422); `DELETE` responde 409 si está en una ruta o tiene facturas.
 */
@Injectable()
export class EstudiantesHttp
  extends RepositorioHttp<Estudiante, FiltrosEstudiante>
  implements EstudiantesRepositorio
{
  protected readonly recurso = 'estudiantes';
}
