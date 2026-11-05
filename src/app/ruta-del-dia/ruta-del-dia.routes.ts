import { Routes } from '@angular/router';

/** App del conductor/monitora (layout `shell-conductor`). */
export default [
  { path: '', loadComponent: () => import('./ruta-del-dia-page'), data: { breadcrumb: ['Ruta del día'] } },
  { path: 'recorrido/:id', loadComponent: () => import('./recorrido/recorrido-page'), data: { breadcrumb: ['Ruta del día', 'Recorrido'] } },
] satisfies Routes;
