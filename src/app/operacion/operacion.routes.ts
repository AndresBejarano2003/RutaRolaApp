import { Routes } from '@angular/router';

// Los repositorios (local / API) se eligen en `core/repositorios.ts`.
export default [
  {
    path: 'colegios',
    loadComponent: () => import('./colegios/colegios-page'),
    data: { breadcrumb: ['Operación', 'Colegios'] },
  },
  {
    path: 'rutas',
    loadComponent: () => import('./rutas/rutas-page'),
    data: { breadcrumb: ['Operación', 'Rutas'] },
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./vehiculos/vehiculos-page'),
    data: { breadcrumb: ['Operación', 'Vehículos'] },
  },
  {
    path: 'conductores',
    loadComponent: () => import('./conductores/conductores-page'),
    data: { breadcrumb: ['Operación', 'Conductores'] },
  },
  {
    path: 'asignaciones',
    loadComponent: () => import('./asignaciones/asignaciones-page'),
    data: { breadcrumb: ['Operación', 'Asignaciones'] },
  },
  { path: '**', redirectTo: 'colegios' },
] satisfies Routes;
