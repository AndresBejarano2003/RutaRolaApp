import { Routes } from '@angular/router';

/** Layout con barra superior y menú lateral, compartido por los módulos internos. */
const shell = () => import('./layout/shell/shell');

export const routes: Routes = [
  // Páginas públicas (sin layout)
  { path: 'login', loadComponent: () => import('./autenticacion/login/login-page') },
  { path: 'registro', loadComponent: () => import('./autenticacion/registro/registro-page') },
  { path: 'editar-usuario', loadComponent: () => import('./inicio/editar-usuario/editar-usuario-page') },
  { path: 'offline-membership', loadComponent: () => import('./sistema/membresias/membresias-page') },

  // Módulos internos (con layout)
  { path: 'inicio', loadComponent: shell, loadChildren: () => import('./inicio/inicio.routes') },
  { path: 'personas', loadComponent: shell, loadChildren: () => import('./personas/personas.routes') },
  { path: 'finanzas', loadComponent: shell, loadChildren: () => import('./finanzas/finanzas.routes') },
  { path: 'operacion', loadComponent: shell, loadChildren: () => import('./operacion/operacion.routes') },
  { path: 'sistema', loadComponent: shell, loadChildren: () => import('./sistema/sistema.routes') },

  { path: '**', redirectTo: 'login' },
];
