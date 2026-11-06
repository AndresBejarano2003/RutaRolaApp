import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, interval, merge } from 'rxjs';
import { TiempoReal } from 'src/app/core/tiempo-real';
import { environment } from '@environments/environment';
import { PortalAcudiente } from './portal';
import { PortalRepositorio } from './portal-repositorio';

/**
 * `GET {apiUrl}/portal` → `PortalAcudiente` del acudiente del token (403 para otros roles).
 * El servidor arma lo mismo que `PortalLocal`: estudiantes del acudiente (colegio, horario del curso,
 * ruta activa con su asignación vigente y recorrido de hoy), estado de cuenta con las reglas de
 * `calcularEstadoCuenta`, recibos (válidos y anulados) y cotizaciones con su `acudienteId`.
 * Solo lectura: el acudiente no modifica nada desde el portal.
 * `observarCambios`: hub `/hubs/recorridos`; el servidor envía `recorridoActualizado` al acudiente de
 * cada estudiante del recorrido sin que lo pida (grupo del acudiente). Respaldo cada 2 minutos.
 */
@Injectable()
export class PortalHttp extends PortalRepositorio {
  private readonly http = inject(HttpClient);
  private readonly tiempoReal = inject(TiempoReal);

  obtener(): Observable<PortalAcudiente> {
    return this.http.get<PortalAcudiente>(`${environment.apiUrl}/portal`);
  }

  observarCambios(): Observable<unknown> {
    return merge(this.tiempoReal.avisos(), interval(120_000));
  }
}
