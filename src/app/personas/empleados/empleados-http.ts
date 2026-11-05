import { Injectable } from '@angular/core';
import { RepositorioHttp } from 'src/app/shared/crud/repositorio-http';
import { Empleado, FiltrosEmpleado } from './empleado';
import { EmpleadosRepositorio } from './empleados-repositorio';

/**
 * Conexión al API: `{apiUrl}/empleados`. Filtros como query params:
 * `texto`, `tipoEmpleado`, `estado`, `pagina`, `tamano`.
 *
 * El contrato adjunto viaja en el JSON como `contrato: { nombre, tipo,
 * tamano, url }` con `url` en base64 (data URL). Si el API prefiere
 * multipart/form-data, sobrescribir `crear` y `actualizar` aquí.
 */
@Injectable()
export class EmpleadosHttp
  extends RepositorioHttp<Empleado, FiltrosEmpleado>
  implements EmpleadosRepositorio
{
  protected readonly recurso = 'empleados';
}
