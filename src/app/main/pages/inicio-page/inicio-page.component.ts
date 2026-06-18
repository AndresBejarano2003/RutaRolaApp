import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from 'rxjs';
import { SideMenuHeaderComponent } from '../../components/side-menu/side-menu-header/side-menu-header.component';
import { SideMenuOptionsComponent } from '../../components/side-menu/side-menu-options/side-menu-options.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexPlotOptions,
  NgApexchartsModule
} from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
};


@Component({
  selector: 'app-inicio-page',
  imports: [
    SideMenuHeaderComponent,
    SideMenuOptionsComponent,
    RouterOutlet,
    NgApexchartsModule,
    FormsModule
  ],
  templateUrl: './inicio-page.component.html',
})
export default class InicioPageComponent {
  // 1. Defines los Signals al inicio de la clase
  hasContent = signal<boolean>(true);
  isInicio = signal<boolean>(false);
  public financialChart!: ChartOptions;
  public financialMonthChart!: ChartOptions;
  public studentsChart: any;


  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });

    this.financialChart = {

      series: [
        {
          name: 'Ingresos',
          data: [12, 15, 14, 18, 20, 19, 23, 21, 25, 24, 28, 30]
        },
        {
          name: 'Facturado',
          data: [14, 17, 16, 20, 22, 21, 26, 25, 28, 29, 31, 34]
        },
        {
          name: 'Pendiente',
          data: [3, 2, 4, 3, 5, 4, 3, 5, 4, 3, 4, 3]
        }
      ],

      chart: {
        type: 'area',
        height: 320,
        toolbar: {
          show: false
        },
        background: 'transparent'
      },

      stroke: {
        curve: 'smooth',
        width: 3
      },

      dataLabels: {
        enabled: false
      },

      xaxis: {
        categories: [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic'
        ]
      },

      legend: {
        position: 'top'
      },

      tooltip: {
        theme: 'dark'
      },

      plotOptions: {},

      colors: ['#2563eb', '#10b981', '#f59e0b']
    };

    this.loadFinancialChart();
    this.loadStudentsChart();
  }

  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  selectedMonth = new Date().getMonth() + 1;

  loadFinancialChart() {

    this.financialMonthChart = {

      series: [
        {
          name: 'Facturación',
          data: [
            1200000,
            1800000,
            2400000,
            1600000,
            2800000,
            3200000,
            2600000
          ]
        }
      ],

      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },

      colors: ['#2563eb'],

      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '50%'
        }
      },

      dataLabels: {
        enabled: false
      },

      xaxis: {
        categories: [
          'Semana 1',
          'Semana 2',
          'Semana 3',
          'Semana 4',
          'Semana 5',
          'Semana 6',
          'Semana 7'
        ],
        labels: {
          style: {
            colors: '#9ca3af'
          }
        }
      },

      stroke: {
        show: true,
        width: 2
      },

      legend: {
        show: false
      },

      tooltip: {
        theme: 'dark'
      }

    };

  }

  loadStudentsChart() {

    this.studentsChart = {

      series: [
        420,
        310,
        275,
        180,
        60
      ],

      chart: {
        type: 'donut',
        height: 350
      },

      labels: [
        'Colegio San Cayetano',
        'Colegio Matre Paula',
        'Colegio La Gaitana',
        'Colegio Enrique Olaya Herrera',
        'Otros'
      ],

      colors: [
        '#2563eb',
        '#10b981',
        '#f59e0b',
        '#8b5cf6',
        '#ef4444'
      ],

      legend: {
        position: 'bottom',
        labels: {
          colors: '#d1d5db'
        }
      }

    };

  }

  checkRoute() {
    // Extraemos la ruta limpia (sin query params como ?tab=1)
    const url = this.router.url.split('?')[0];

    const emptyRoutes = [
      // '/personas/acudientes',
      // '/personas/empleados',
      '/sistema/documentacion',
      // '/sistema/soporte',
      // '/finanzas/cotizaciones',
      // '/finanzas/contrataciones',
      '/finanzas/recibos',
      // '/finanzas/programacion-facturacion',
      '/finanzas/reportes-financieros/ingresos',
      '/finanzas/reportes-financieros/facturas-pendientes',
      '/finanzas/reportes-financieros/morosos',
      '/operacion/rutas',
      '/operacion/vehiculos',
      '/operacion/conductores',
      '/operacion/asignaciones',
    ];

    this.hasContent.set(!emptyRoutes.includes(url));

    this.isInicio.set(url === '/inicio');

  }

}
