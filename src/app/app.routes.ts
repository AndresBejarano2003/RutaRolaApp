import { Routes } from '@angular/router';

export const routes: Routes = [
  // Páginas públicas (sin layout)
  { path: 'registro', loadComponent: () => import('./autenticacion/registro/registro-page') },
  { path: 'editar-usuario', loadComponent: () => import('./inicio/editar-usuario/editar-usuario-page') },
  { path: 'offline-membership', loadComponent: () => import('./sistema/membresias/membresias-page') },

  // Login + sistemas por tipo de usuario (con layout, repositorios y guards): ver modulos.routes.ts
  { path: '', loadChildren: () => import('./modulos.routes') },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
