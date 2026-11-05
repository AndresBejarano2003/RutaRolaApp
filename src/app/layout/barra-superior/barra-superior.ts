import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService, USUARIO_DEMO } from 'src/app/core/auth';
import { CampanaNotificaciones } from '../campana-notificaciones/campana-notificaciones';

interface OpcionUsuario {
  icono: string;
  etiqueta: string;
  ruta: string;
  cerrarSesion?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-barra-superior',
  imports: [RouterLink, RouterLinkActive, CampanaNotificaciones],
  templateUrl: './barra-superior.html',
})
export class BarraSuperior {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** Breadcrumb de la ruta activa más profunda (`data.breadcrumb`). */
  protected readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => this.leerBreadcrumb()),
    ),
    { initialValue: this.leerBreadcrumb() },
  );

  // TODO: reemplazar por los datos del usuario autenticado.
  protected readonly usuario = USUARIO_DEMO;

  protected readonly opcionesUsuario: OpcionUsuario[] = [
    { icono: 'fa-solid fa-user', etiqueta: 'Mi perfil', ruta: '/inicio/perfil' },
    { icono: 'fa-solid fa-gear', etiqueta: 'Configuración', ruta: '/inicio/configuracion' },
    {
      icono: 'fa-solid fa-right-from-bracket',
      etiqueta: 'Cerrar sesión',
      ruta: '/login',
      cerrarSesion: true,
    },
  ];

  protected alSeleccionar(opcion: OpcionUsuario): void {
    if (opcion.cerrarSesion) {
      this.auth.cerrarSesion();
    }
  }

  private leerBreadcrumb(): string[] {
    // Se lee del estado del router (no de ActivatedRoute): durante la primera
    // navegación el snapshot de ActivatedRoute todavía no existe.
    let actual = this.router.routerState.snapshot.root;
    while (actual.firstChild) {
      actual = actual.firstChild;
    }
    return (actual.data['breadcrumb'] as string[] | undefined) ?? [];
  }
}
