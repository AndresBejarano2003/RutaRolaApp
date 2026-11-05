import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { Estudiante, FiltrosEstudiante } from './estudiante';
import { EstudiantesRepositorio } from './estudiantes-repositorio';

/**
 * Conexión al API: `{apiUrl}/estudiantes`. Filtros enviados como query
 * params: `texto`, `colegioId`, `grado`, `estado`, `pagina`, `tamano`.
 */
@Injectable()
export class EstudiantesHttp
  extends RepositorioHttp<Estudiante, FiltrosEstudiante>
  implements EstudiantesRepositorio
{
  protected readonly recurso = 'estudiantes';
}
