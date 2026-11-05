import { Routes } from '@angular/router';

/** Página temporal para las secciones que aún no tienen contenido. */
const enConstruccion = () => import('../shared/en-construccion/en-construccion-page');

export default [
  {
    path: 'colegios',
    loadComponent: () => import('./colegios/colegios-page'),
    data: { breadcrumb: ['Operación', 'Colegios'] },
  },
  {
    path: 'rutas',
    loadComponent: enConstruccion,
    data: { breadcrumb: ['Operación', 'Rutas'] },
  },
  {
    path: 'vehiculos',
    // Lista para conectar: () => import('./vehiculos/vehiculos-page')
    loadComponent: enConstruccion,
    data: { breadcrumb: ['Operación', 'Vehículos'] },
  },
  {
    path: 'conductores',
    loadComponent: enConstruccion,
    data: { breadcrumb: ['Operación', 'Conductores'] },
  },
  {
    path: 'asignaciones',
    loadComponent: enConstruccion,
    data: { breadcrumb: ['Operación', 'Asignaciones'] },
  },
  { path: '**', redirectTo: 'colegios' },
] satisfies Routes;
