import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./main/pages/login/login-page/login-page.component'),
  },
  {
    path: 'inicio/:query',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
  },
  {
    path: 'personas',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
    children: [
      {
        path: 'estudiantes',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: 'acudientes',
        loadComponent: () =>
          import('./main/pages/search-page/search-page.component')
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: '**',
        redirectTo: 'estudiantes',
      }
    ]
  },
  {
    path: 'finanzas',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
    children: [
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: 'contrataciones',
        loadComponent: () =>
          import('./main/pages/search-page/search-page.component')
      },
      {
        path: 'recibos',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: 'programacion-facturación',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: 'reportes-financieros',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component'),
        children: [
          {
            path: 'ingresos',
            loadComponent: () =>
              import('./main/pages/trending-page/trending-page.component')
          },
          {
            path: 'facturas-pendientes',
            loadComponent: () =>
              import('./main/pages/trending-page/trending-page.component')
          },
          {
            path: 'morosos',
            loadComponent: () =>
              import('./main/pages/trending-page/trending-page.component')
          },
          {
            path: '**',
            redirectTo: 'ingresos',
          }
        ]
      },
      {
        path: '**',
        redirectTo: 'cotizaciones',
      }
    ]
  },
  {
    path: 'operacion',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
    children: [
      {
        path: 'colegios',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./main/pages/search-page/search-page.component')
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: 'conductores',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: 'asignaciones',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component')
      },
      {
        path: '**',
        redirectTo: 'colegios',
      }
    ]
  },
  {
    path: 'documentacion',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
  },
  {
    path: 'soporte',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
  },
  {
    path: 'pro-version',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
  },
  {
    path: '**',
    redirectTo: 'login',
  }
];
