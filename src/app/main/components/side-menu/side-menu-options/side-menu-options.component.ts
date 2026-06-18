import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GifService } from 'src/app/main/services/main.service';

interface MenuOption {
  icon: string;
  label: string;
  route: string;

  spanPro?: boolean;
  spanNotify?: boolean;
  cantidadNotify?: number;
  children?: MenuOption[];
}

@Component({
  selector: 'main-side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options.component.html',
})
export class SideMenuOptionsComponent {
  GifService = inject(GifService);
  openedMenus: Set<string> = new Set();

  menuOptsOperative: MenuOption[] = [
    {
      icon: 'fa-solid fa-house',
      label: 'Inicio',
      route: '/inicio',
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Personas',
      route: '/personas/search',
      children: [
        {
          icon: 'fa-solid fa-user-graduate',
          label: 'Estudiantes',
          route: '/personas/estudiantes',
        },
        {
          icon: 'fa-solid fa-users',
          label: 'Acudientes',
          route: '/personas/acudientes',
        },
        {
          icon: 'fa-solid fa-user-tie',
          label: 'Empleados',
          route: '/personas/empleados',
        }
      ]
    },
    {
      icon: 'fa-solid fa-box',
      label: 'Finanzas',
      route: '/finanzas/search',
      children: [
        {
          icon: 'fa-solid fa-file-lines',
          label: 'Cotizaciones',
          route: '/finanzas/cotizaciones',
        },
        {
          icon: 'fa-solid fa-file-signature',
          label: 'Contrataciones',
          route: '/finanzas/contrataciones',
        },
        {
          icon: 'fa-solid fa-receipt',
          label: 'Recibos',
          route: '/finanzas/recibos',
        },
        {
          icon: 'fa-solid fa-calendar-check',
          label: 'Programación de facturación',
          route: '/finanzas/programacion-facturacion',
        },
        {
          icon: 'fa-solid fa-chart-line',
          label: 'Reportes financieros',
          route: '/finanzas/reportes-financieros',
          children: [
            {
              icon: 'fa-solid fa-dollar-sign',
              label: 'Ingresos',
              route: '/finanzas/reportes-financieros/ingresos',
            },
            {
              icon: 'fa-solid fa-clock',
              label: 'Facturas pendientes',
              route: '/finanzas/reportes-financieros/facturas-pendientes',
            },
            {
              icon: 'fa-solid fa-triangle-exclamation',
              label: 'Morosos',
              route: '/finanzas/reportes-financieros/morosos',
            },
          ]
        }
      ]
    },
    {
      icon: 'fa-solid fa-box',
      label: 'Operación',
      route: '/operacion/search',
      children: [
        {
          icon: 'fa-solid fa-school',
          label: 'Colegios',
          route: '/operacion/colegios',
        },
        {
          icon: 'fa-solid fa-route',
          label: 'Rutas',
          route: '/operacion/rutas',
        },
        {
          icon: 'fa-solid fa-bus',
          label: 'Vehiculos',
          route: '/operacion/vehiculos',
        },
        {
          icon: 'fa-solid fa-id-badge',
          label: 'Conductores',
          route: '/operacion/conductores',
        },
        {
          icon: 'fa-solid fa-diagram-project',
          label: 'Asignaciones',
          route: '/operacion/asignaciones',
        }
      ]
    },
  ];
  menuOptsSystem: MenuOption[] = [
    {
      icon: 'fa-solid fa-headset',
      // icon: 'fa-solid fa-circle-question',
      // icon: 'fa-solid fa-book-open',
      label: 'Centro de Ayuda',
      route: '/sistema/soporte',
    },
    {
      icon: 'fa-solid fa-crown',
      label: 'Planes y Membresías',
      route: '/sistema/membership',
    },
  ];

  constructor() {

    const savedMenus = localStorage.getItem('openedMenus');

    if (savedMenus) {
      this.openedMenus = new Set(JSON.parse(savedMenus));
    }

  }

  toggleMenu(menu: string) {

    if (this.openedMenus.has(menu)) {
      this.openedMenus.delete(menu);
    } else {
      this.openedMenus.add(menu);
    }

    // GUARDAR EN LOCALSTORAGE
    localStorage.setItem(
      'openedMenus',
      JSON.stringify([...this.openedMenus])
    );

  }

  isMenuOpen(menu: string): boolean {
    return this.openedMenus.has(menu);
  }
}
