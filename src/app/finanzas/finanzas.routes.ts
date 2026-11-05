import { Routes } from '@angular/router';

/** Página temporal para las secciones que aún no tienen contenido. */
const enConstruccion = () => import('../shared/en-construccion/en-construccion-page');

export default [
  {
    path: 'cotizaciones',
    loadComponent: () => import('./cotizaciones/cotizaciones-page'),
    data: { breadcrumb: ['Finanzas', 'Cotizaciones'] },
  },
  {
    path: 'contrataciones',
    loadComponent: () => import('./contrataciones/contrataciones-page'),
    data: { breadcrumb: ['Finanzas', 'Contrataciones'] },
  },
  {
    path: 'recibos',
    // Lista para conectar: () => import('./recibos/recibos-page')
    loadComponent: enConstruccion,
    data: { breadcrumb: ['Finanzas', 'Recibos'] },
  },
  {
    path: 'programacion-facturacion',
    loadComponent: () => import('./programacion-facturacion/programacion-facturacion-page'),
    data: { breadcrumb: ['Finanzas', 'Programación de Facturación'] },
  },
  {
    path: 'reportes-financieros',
    children: [
      {
        path: 'ingresos',
        // Lista para conectar: () => import('./reportes/ingresos/reporte-ingresos-page')
        loadComponent: enConstruccion,
        data: { breadcrumb: ['Finanzas', 'Reportes Financieros', 'Ingresos'] },
      },
      {
        path: 'facturas-pendientes',
        // Lista para conectar: () => import('./reportes/facturas-pendientes/reporte-facturas-pendientes-page')
        loadComponent: enConstruccion,
        data: { breadcrumb: ['Finanzas', 'Reportes Financieros', 'Facturas Pendientes'] },
      },
      {
        path: 'morosos',
        // Lista para conectar: () => import('./reportes/morosos/reporte-morosos-page')
        loadComponent: enConstruccion,
        data: { breadcrumb: ['Finanzas', 'Reportes Financieros', 'Morosos'] },
      },
      { path: '**', redirectTo: 'ingresos' },
    ],
  },
  { path: '**', redirectTo: 'cotizaciones' },
] satisfies Routes;
