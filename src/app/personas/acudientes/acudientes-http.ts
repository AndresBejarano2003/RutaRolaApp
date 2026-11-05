import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { Acudiente, FiltrosAcudiente } from './acudiente';
import { AcudientesRepositorio } from './acudientes-repositorio';

/**
 * Conexión al API: `{apiUrl}/acudientes`. Filtros como query params:
 * `texto`, `estado`, `pagina`, `tamano`.
 *
 * Regla de negocio que debe aplicar el API: `DELETE` responde 409 con
 * `{ "mensaje": "..." }` si el acudiente tiene estudiantes a cargo.
 */
@Injectable()
export class AcudientesHttp
  extends RepositorioHttp<Acudiente, FiltrosAcudiente>
  implements AcudientesRepositorio
{
  protected readonly recurso = 'acudientes';
}
