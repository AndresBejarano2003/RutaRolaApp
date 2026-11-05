import { Routes } from '@angular/router';
import { proveerRepositorios } from './core/repositorios';

/** Layout con barra superior y menú lateral, compartido por los módulos internos. */
const shell = () => import('./layout/shell/shell');

/**
 * Módulos internos (con layout). Se cargan de forma diferida junto con los
 * repositorios: la ruta padre los provee UNA vez para todos los módulos, así
 * comparten instancias (los módulos se enlazan entre sí) sin inflar el bundle inicial.
 */
export default [
  {
    path: '',
    providers: proveerRepositorios(),
    children: [
      { path: 'inicio', loadComponent: shell, loadChildren: () => import('./inicio/inicio.routes') },
      { path: 'personas', loadComponent: shell, loadChildren: () => import('./personas/personas.routes') },
      { path: 'finanzas', loadComponent: shell, loadChildren: () => import('./finanzas/finanzas.routes') },
      { path: 'operacion', loadComponent: shell, loadChildren: () => import('./operacion/operacion.routes') },
      { path: 'sistema', loadComponent: shell, loadChildren: () => import('./sistema/sistema.routes') },
    ],
  },
] satisfies Routes;
