import { Routes } from '@angular/router';
import { EstudiantesLocal } from './estudiantes/estudiantes-local';
import { EstudiantesRepositorio } from './estudiantes/estudiantes-repositorio';

export default [
  {
    path: 'estudiantes',
    loadComponent: () => import('./estudiantes/estudiantes-page'),
    data: { breadcrumb: ['Personas', 'Estudiantes'] },
    providers: [
      // Para conectar el API, cambiar a: useClass: EstudiantesHttp (./estudiantes/estudiantes-http)
      { provide: EstudiantesRepositorio, useClass: EstudiantesLocal },
    ],
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
