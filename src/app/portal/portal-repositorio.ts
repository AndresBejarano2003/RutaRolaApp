import { Observable } from 'rxjs';
import { PortalAcudiente } from './portal';

/**
 * Datos del acudiente AUTENTICADO (sale de la sesión/token, nunca de un parámetro): sus estudiantes
 * con colegio, ruta y recorrido de hoy; su estado de cuenta; recibos y cotizaciones.
 * Implementaciones: `PortalLocal` (temporal) → `PortalHttp`.
 */
export abstract class PortalRepositorio {
  abstract obtener(): Observable<PortalAcudiente>;
}
