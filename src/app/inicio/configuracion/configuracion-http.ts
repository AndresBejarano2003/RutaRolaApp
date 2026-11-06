import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { EstadoRegistro } from 'src/app/shared/crud/crud';
import { DatosEmpresa, Empresa, Parametro } from './configuracion';
import { ConfiguracionRepositorio } from './configuracion-repositorio';

/** `EmpresaDto` del API: los opcionales pueden llegar en `null`. */
type EmpresaApi = Omit<Empresa, 'direccion' | 'ciudad' | 'telefono' | 'email' | 'logoUrl'> &
  Partial<Record<'direccion' | 'ciudad' | 'telefono' | 'email' | 'logoUrl', string | null>>;

export function desdeApi(e: EmpresaApi): Empresa {
  return {
    ...e,
    direccion: e.direccion ?? '',
    ciudad: e.ciudad ?? '',
    telefono: e.telefono ?? '',
    email: e.email ?? '',
    logoUrl: e.logoUrl ?? '',
    estado: e.estado as EstadoRegistro,
  };
}

/**
 * | Operación       | Petición |
 * |-----------------|----------|
 * | empresa         | `GET /empresas/actual` |
 * | guardarEmpresa  | `PUT /empresas/actual {nombre, direccion, ciudad, telefono, email, logoUrl}` (`configuracion.gestionar`; no cambia NIT ni estado) |
 * | parametros      | `GET /configuracion` → `Parametro[]` (`configuracion.gestionar`) |
 * | guardarParametro| `PUT /configuracion/{clave} {valor}` (422 fuera de `minimo`–`maximo`) |
 *
 * Los parámetros los usa el servidor en reportes, portal, tablero, notificaciones y conductores.
 */
@Injectable()
export class ConfiguracionHttp extends ConfiguracionRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  empresa(): Observable<Empresa> {
    return this.http.get<EmpresaApi>(`${this.url}/empresas/actual`).pipe(map(desdeApi));
  }

  guardarEmpresa(datos: DatosEmpresa): Observable<Empresa> {
    return this.http.put<EmpresaApi>(`${this.url}/empresas/actual`, datos).pipe(map(desdeApi));
  }

  parametros(): Observable<Parametro[]> {
    return this.http.get<Parametro[]>(`${this.url}/configuracion`);
  }

  guardarParametro(clave: string, valor: string): Observable<Parametro> {
    return this.http.put<Parametro>(`${this.url}/configuracion/${encodeURIComponent(clave)}`, { valor });
  }
}
