import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./main/pages/login/login-page/login-page.component'),
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
    data: {
      breadcrumb: ['Inicio']
    },
    children: [

      {
        path: 'perfil',
        loadComponent: () =>
          import('./main/pages/perfil-page/perfil-page.component'),
        data: {
          breadcrumb: ['Inicio', 'Perfil']
        }
      },

      {
        path: 'configuracion',
        loadComponent: () =>
          import('./main/pages/configuracion-page/configuracion-page.component'),
        data: {
          breadcrumb: ['Inicio', 'Configuración']
        }
      },
    ]
  },
  {
    path: 'personas',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
    data: {
      breadcrumb: ['Personas']
    },
    children: [
      {
        path: 'estudiantes',
        loadComponent: () =>
          import('./main/pages/personas-module/estudiantes-page/estudiantes-page.component'),
        data: {
          breadcrumb: ['Personas', 'Estudiantes']
        }
      },
      {
        path: 'estudiantes',
        loadComponent: () =>
          import('./main/pages/personas-module/estudiantes-page/estudiantes-page.component'),
        data: {
          breadcrumb: ['Personas', 'Estudiantes']
        }
      },
      {
        path: 'acudientes',
        loadComponent: () =>
          import('./main/pages/personas-module/acudientes-page/acudientes-page.component'),
        data: {
          breadcrumb: ['Personas', 'Acudientes']
        }
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./main/pages/personas-module/empleados-page/empleados-page.component'),
        data: {
          breadcrumb: ['Personas', 'Empleados']
        }
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
    data: {
      breadcrumb: ['Finanzas']
    },
    children: [
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./main/pages/finanzas-module/cotizaciones-page/cotizaciones-page.component'),
        data: {
          breadcrumb: ['Finanzas', 'Cotizaciones']
        }
      },
      {
        path: 'contrataciones',
        loadComponent: () =>
          import('./main/pages/finanzas-module/contrataciones-page/contrataciones-page.component'),
        data: {
          breadcrumb: ['Finanzas', 'Contrataciones']
        }
      },
      {
        path: 'recibos',
        loadComponent: () =>
          import('./main/pages/finanzas-module/recibos-page/recibos-page.component'),
        data: {
          breadcrumb: ['Finanzas', 'Recibos']
        }
      },
      {
        path: 'programacion-facturacion',
        loadComponent: () =>
          import('./main/pages/finanzas-module/programacion-facturacion-page/programacion-facturacion-page.component'),
        data: {
          breadcrumb: ['Finanzas', 'Programación de Facturación']
        }
      },
      {
        path: 'reportes-financieros',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component'),
        data: {
          breadcrumb: ['Finanzas', 'Reportes Financieros']
        },
        children: [
          {
            path: 'ingresos',
            loadComponent: () =>
              import('./main/pages/trending-page/trending-page.component'),
            data: {
              breadcrumb: ['Finanzas', 'Reportes Financieros', 'Ingresos']
            }
          },
          {
            path: 'facturas-pendientes',
            loadComponent: () =>
              import('./main/pages/trending-page/trending-page.component'),
            data: {
              breadcrumb: ['Finanzas', 'Reportes Financieros', 'Facturas Pendientes']
            }
          },
          {
            path: 'morosos',
            loadComponent: () =>
              import('./main/pages/trending-page/trending-page.component'),
            data: {
              breadcrumb: ['Finanzas', 'Reportes Financieros', 'Morosos']
            }
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
    data: {
      breadcrumb: ['Operación']
    },
    children: [
      {
        path: 'colegios',
        loadComponent: () =>
          import('./main/pages/operacion-module/colegios-page/colegios-page.component'),
        data: {
          breadcrumb: ['Operación', 'Colegios']
        }
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./main/pages/search-page/search-page.component'),
        data: {
          breadcrumb: ['Operación', 'Rutas']
        }
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component'),
        data: {
          breadcrumb: ['Operación', 'Vehículos']
        }
      },
      {
        path: 'conductores',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component'),
        data: {
          breadcrumb: ['Operación', 'Conductores']
        }
      },
      {
        path: 'asignaciones',
        loadComponent: () =>
          import('./main/pages/trending-page/trending-page.component'),
        data: {
          breadcrumb: ['Operación', 'Asignaciones']
        }
      },
      {
        path: '**',
        redirectTo: 'colegios',
      }
    ]
  },
  {
    path: 'sistema',
    loadComponent: () =>
      import('./main/pages/inicio-page/inicio-page.component'),
    data: {
      breadcrumb: ['Sistema']
    },
    children: [

      {
        path: 'soporte',
        loadComponent: () =>
          import('./main/pages/system-module/soporte-page/soporte-page.component'),
        data: {
          breadcrumb: ['Sistema', 'Soporte']
        }
      },

      {
        path: 'membership',
        loadComponent: () =>
          import('./main/pages/membership-page/membership-page.component'),
        data: {
          breadcrumb: ['Sistema', 'Planes y Membresías']
        }
      },

      {
        path: '**',
        redirectTo: 'membership'
      }

    ]
  },
  // {
  //   path: 'perfil',
  //   loadComponent: () =>
  //     import('./main/pages/perfil-page/perfil-page.component'),
  // },
  {
    path: 'registro',
    loadComponent: () =>
      import('./main/pages/registro-page/registro-page.component'),
  },
  {
    path: 'editar-usuario',
    loadComponent: () =>
      import('./main/pages/editar-usuario-page/editar-usuario-page.component'),
  },
  {
    path: 'offline-membership',
    loadComponent: () =>
      import('./main/pages/membership-page/membership-page.component'),
  },
  // {
  //   path: 'configuracion',
  //   loadComponent: () =>
  //     import('./main/pages/inicio-page/inicio-page.component'),
  // },
  {
    path: '**',
    redirectTo: 'login',
  }
];
