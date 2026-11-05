import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/core/auth';
import { PortalEstado } from 'src/app/portal/portal-estado';
import { ContenedorNotificaciones } from 'src/app/shared/notificaciones/contenedor-notificaciones';

/** Secciones del portal (barra inferior en celular, pestañas en pantallas grandes). */
export const SECCIONES_PORTAL = [
  { ruta: '/portal', texto: 'Inicio', icono: 'fa-solid fa-house', exacta: true },
  { ruta: '/portal/estudiantes', texto: 'Estudiantes', icono: 'fa-solid fa-children', exacta: false },
  { ruta: '/portal/pagos', texto: 'Pagos', icono: 'fa-solid fa-file-invoice-dollar', exacta: false },
  { ruta: '/portal/cotizaciones', texto: 'Cotizaciones', icono: 'fa-solid fa-file-lines', exacta: false },
];

/** Layout del portal del acudiente: encabezado con su nombre y navegación entre secciones. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-shell-portal',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ContenedorNotificaciones],
  templateUrl: './shell-portal.html',
})
export default class ShellPortal implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly estado = inject(PortalEstado);

  protected readonly sesion = this.auth.sesion;
  protected readonly secciones = SECCIONES_PORTAL;

  ngOnInit(): void {
    void this.estado.cargar();
  }

  protected salir(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}
