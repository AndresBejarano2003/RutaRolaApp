import { Routes } from '@angular/router';

export const routes: Routes = [
  // Páginas públicas (sin layout)
  { path: 'login', loadComponent: () => import('./autenticacion/login/login-page') },
  { path: 'registro', loadComponent: () => import('./autenticacion/registro/registro-page') },
  { path: 'editar-usuario', loadComponent: () => import('./inicio/editar-usuario/editar-usuario-page') },
  { path: 'offline-membership', loadComponent: () => import('./sistema/membresias/membresias-page') },

  // Módulos internos (con layout y repositorios): ver modulos.routes.ts
  { path: '', loadChildren: () => import('./modulos.routes') },

  { path: '**', redirectTo: 'login' },
];
