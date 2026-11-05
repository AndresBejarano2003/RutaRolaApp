import { Routes } from '@angular/router';

export default [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./dashboard/dashboard-page'),
    data: { breadcrumb: ['Inicio'] },
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil-page'),
    data: { breadcrumb: ['Inicio', 'Perfil'] },
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./configuracion/configuracion-page'),
    data: { breadcrumb: ['Inicio', 'Configuración'] },
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./notificaciones/notificaciones-page'),
    data: { breadcrumb: ['Inicio', 'Notificaciones'] },
  },
] satisfies Routes;
