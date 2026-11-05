import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { estabilizar, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import FacturasPage from './finanzas/facturas/facturas-page';
import RecibosPage from './finanzas/recibos/recibos-page';
import ReporteIngresosPage from './finanzas/reportes/ingresos/reporte-ingresos-page';
import ReporteMorososPage from './finanzas/reportes/morosos/reporte-morosos-page';
import ReportePendientesPage from './finanzas/reportes/facturas-pendientes/reporte-pendientes-page';
import AsignacionesPage from './operacion/asignaciones/asignaciones-page';
import ConductoresPage from './operacion/conductores/conductores-page';
import RutasPage from './operacion/rutas/rutas-page';
import VehiculosPage from './operacion/vehiculos/vehiculos-page';

/** Cada pantalla carga sus datos (y los de los módulos enlazados) sin errores. */
const PANTALLAS: [string, Type<unknown>, string][] = [
  ['Rutas', RutasPage, 'R-01'],
  ['Vehículos', VehiculosPage, 'WTN482'],
  ['Asignaciones', AsignacionesPage, 'WTN482'],
  ['Conductores', ConductoresPage, 'Cárdenas'],
  ['Facturas', FacturasPage, 'FAC-0001'],
  ['Recibos', RecibosPage, 'REC-'],
  ['Reporte de ingresos', ReporteIngresosPage, 'Total recaudado'],
  ['Reporte de facturas pendientes', ReportePendientesPage, 'Cuotas sin pago'],
  ['Reporte de morosos', ReporteMorososPage, 'Acudientes en mora'],
];

describe('Pantallas de Operación y Finanzas', () => {
  beforeEach(() => {
    localStorage.clear();
    simularDialogos();
  });

  for (const [nombre, pagina, texto] of PANTALLAS) {
    it(`${nombre} carga sus datos`, async () => {
      TestBed.configureTestingModule({ imports: [pagina], providers: [provideRouter([]), ...repositoriosDePrueba()] });
      const fixture = TestBed.createComponent(pagina);
      await estabilizar(fixture, 4);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain(texto);
      expect(el.querySelector('[role="alert"].alert-error')).toBeNull();
      expect(el.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });
  }
});
