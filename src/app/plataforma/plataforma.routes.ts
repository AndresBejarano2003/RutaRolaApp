import { Routes } from '@angular/router';

/** Plataforma RutaRola (SUPER_ADMIN, layout `shell-plataforma`). */
export default [
  { path: '', pathMatch: 'full', redirectTo: 'empresas' },
  { path: 'empresas', loadComponent: () => import('./empresas/empresas-page'), data: { breadcrumb: ['Plataforma', 'Empresas'] } },
  { path: 'cuenta', loadComponent: () => import('../autenticacion/cuenta/cuenta-page'), data: { breadcrumb: ['Plataforma', 'Mi cuenta'] } },
  { path: '**', redirectTo: 'empresas' },
] satisfies Routes;
