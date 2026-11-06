import { HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService, TokensSesion } from './auth';

/** Rutas del API que no llevan token ni se renuevan (la propia sesión). */
const RUTAS_PUBLICAS = ['/auth/login', '/auth/refresh', '/auth/logout'];

export function esDelApi(url: string): boolean {
  return url.startsWith(environment.apiUrl);
}

function esPublica(url: string): boolean {
  const ruta = url.slice(environment.apiUrl.length).split('?')[0];
  return RUTAS_PUBLICAS.includes(ruta);
}

function conToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/**
 * Renovación de la sesión del API. Si varias peticiones reciben 401 a la vez, todas esperan UNA sola
 * llamada a `/auth/refresh` (el refresh token es de un solo uso: reusarlo cierra todas las sesiones).
 */
@Injectable({ providedIn: 'root' })
export class RenovacionSesion {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private enCurso: Observable<TokensSesion> | null = null;

  renovar(): Observable<TokensSesion> {
    if (this.enCurso) return this.enCurso;
    // Otra pestaña ya renovó: se usan sus tokens en vez de reusar el refresh viejo.
    if (this.auth.adoptarTokensDeOtraPestana()) return of(this.auth.tokens()!);

    const refreshToken = this.auth.tokens()?.refreshToken;
    if (!refreshToken) return throwError(() => new Error('Sin sesión del API'));

    this.enCurso = this.http.post<TokensSesion>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((tokens) => this.auth.actualizarTokens(tokens)),
      finalize(() => (this.enCurso = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.enCurso;
  }

  /** La sesión ya no se puede renovar: se cierra y se vuelve al login (y luego a donde estaba). */
  expirar(): void {
    const volver = this.router.url;
    this.auth.cerrarSesion({ revocar: false });
    void this.router.navigate(['/login'], { queryParams: volver && volver !== '/login' ? { volver } : {} });
  }
}

/**
 * Agrega `Authorization: Bearer <access token>` a las peticiones al API (`environment.apiUrl`). Ante un
 * 401 renueva con el refresh token y repite la petición UNA vez; si la renovación falla, cierra la
 * sesión y redirige al login. En modo local (sin tokens) no hace nada.
 */
export const interceptorAutenticacion: HttpInterceptorFn = (req, next) => {
  if (!esDelApi(req.url) || esPublica(req.url)) return next(req);

  const auth = inject(AuthService);
  const renovacion = inject(RenovacionSesion);
  const tokens = auth.tokens();
  if (!tokens) return next(req);

  return next(conToken(req, tokens.accessToken)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
      return renovacion.renovar().pipe(
        catchError(() => {
          renovacion.expirar();
          return throwError(() => error);
        }),
        switchMap((nuevos) => next(conToken(req, nuevos.accessToken))),
      );
    }),
  );
};
