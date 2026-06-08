import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

interface UserMenuOption {
  icon: string;
  label: string;
  route: string;
  danger?: boolean;
}

@Component({
  selector: 'main-side-menu-header',
  imports: [RouterLink],
  templateUrl: './side-menu-header.component.html',
})
export class SideMenuHeaderComponent {

  breadcrumbs: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {

        this.loadBreadcrumb();

      });

  }

  loadBreadcrumb() {

    let currentRoute = this.route;

    while (currentRoute.firstChild) {

      currentRoute = currentRoute.firstChild;

    }

    this.breadcrumbs =
      currentRoute.snapshot.data['breadcrumb'] || [];

  }
  // =========================================================
  // INFORMACIÓN DEL USUARIO
  // =========================================================

  userInfo = {
    name: 'Andrés Bejarano',
    email: 'andres@rutarola.com',
    image:
      'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
    online: true,
    role: 'Administrador'
  };


  // =========================================================
  // OPCIONES DEL MENÚ
  // =========================================================

  menuUserOptions: UserMenuOption[] = [
    {
      icon: 'fa-solid fa-user',
      label: 'Mi perfil',
      route: '/inicio/perfil',
    },
    {
      icon: 'fa-solid fa-gear',
      label: 'Configuración',
      route: '/inicio/configuracion',
    },
    {
      icon: 'fa-solid fa-right-from-bracket',
      label: 'Cerrar sesión',
      route: '/login',
      danger: true,
    },
  ];


  // =========================================================
  // LOGOUT
  // =========================================================

  logout() {

    localStorage.clear();

    sessionStorage.clear();

  }

}