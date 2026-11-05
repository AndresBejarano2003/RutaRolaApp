import { Routes } from '@angular/router';

export default [
  {
    path: 'estudiantes',
    loadComponent: () => import('./estudiantes/estudiantes-page'),
    data: { breadcrumb: ['Personas', 'Estudiantes'] },
  },
  {
    path: 'acudientes',
    loadComponent: () => import('./acudientes/acudientes-page'),
    data: { breadcrumb: ['Personas', 'Acudientes'] },
  },
  {
    path: 'empleados',
    loadComponent: () => import('./empleados/empleados-page'),
    data: { breadcrumb: ['Personas', 'Empleados'] },
  },
  { path: '**', redirectTo: 'estudiantes' },
] satisfies Routes;
