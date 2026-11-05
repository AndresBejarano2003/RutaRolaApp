import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

interface GraficoEjes {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
}

interface GraficoCircular {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
}

interface Mes {
  valor: number;
  etiqueta: string;
}

const MESES: Mes[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
].map((etiqueta, i) => ({ valor: i + 1, etiqueta }));

/** Dashboard de /inicio. Los datos son de ejemplo hasta que exista el backend. */
@Component({
  selector: 'app-dashboard-page',
  imports: [NgApexchartsModule, FormsModule],
  templateUrl: './dashboard-page.html',
})
export default class DashboardPage {
  protected readonly meses = MESES;
  protected mesSeleccionado = new Date().getMonth() + 1;

  protected readonly graficoFinanciero: GraficoEjes = {
    series: [
      { name: 'Ingresos', data: [12, 15, 14, 18, 20, 19, 23, 21, 25, 24, 28, 30] },
      { name: 'Facturado', data: [14, 17, 16, 20, 22, 21, 26, 25, 28, 29, 31, 34] },
      { name: 'Pendiente', data: [3, 2, 4, 3, 5, 4, 3, 5, 4, 3, 4, 3] },
    ],
    chart: { type: 'area', height: 320, toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    },
    legend: { position: 'top' },
    tooltip: { theme: 'dark' },
    plotOptions: {},
    colors: ['#2563eb', '#10b981', '#f59e0b'],
  };

  protected graficoFacturacionMensual = this.crearFacturacionMensual();

  protected readonly graficoEstudiantes: GraficoCircular = {
    series: [420, 310, 275, 180, 60],
    chart: { type: 'donut', height: 350 },
    labels: [
      'Colegio San Cayetano',
      'Colegio Matre Paula',
      'Colegio La Gaitana',
      'Colegio Enrique Olaya Herrera',
      'Otros',
    ],
    colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    legend: { position: 'bottom', labels: { colors: '#d1d5db' } },
  };

  protected cargarFacturacionMensual(): void {
    // TODO: pedir al backend la facturación de `mesSeleccionado`.
    this.graficoFacturacionMensual = this.crearFacturacionMensual();
  }

  private crearFacturacionMensual(): GraficoEjes {
    return {
      series: [
        { name: 'Facturación', data: [1200000, 1800000, 2400000, 1600000, 2800000, 3200000, 2600000] },
      ],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      colors: ['#2563eb'],
      plotOptions: { bar: { borderRadius: 8, columnWidth: '50%' } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: Array.from({ length: 7 }, (_, i) => `Semana ${i + 1}`),
        labels: { style: { colors: '#9ca3af' } },
      },
      stroke: { show: true, width: 2 },
      legend: { show: false },
      tooltip: { theme: 'dark' },
    };
  }
}
