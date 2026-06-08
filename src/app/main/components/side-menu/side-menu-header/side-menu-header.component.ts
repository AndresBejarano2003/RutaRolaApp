// side-menu-options.component.ts

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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