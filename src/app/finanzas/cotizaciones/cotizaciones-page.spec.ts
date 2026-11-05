import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import CotizacionesPage from './cotizaciones-page';

describe('CotizacionesPage', () => {
  let fixture: ComponentFixture<CotizacionesPage>;
  let el: HTMLElement;
  let ui: ReturnType<typeof pantalla>;

  beforeEach(async () => {
    localStorage.clear();
    simularDialogos();
    TestBed.configureTestingModule({ imports: [CotizacionesPage], providers: [provideRouter([]), ...repositoriosDePrueba()] });
    fixture = TestBed.createComponent(CotizacionesPage);
    el = fixture.nativeElement;
    ui = pantalla(el);
    await estabilizar(fixture);
  });

  it('lista las cotizaciones', () => {
    expect(ui.filas('app-cotizaciones-tabla').length).toBeGreaterThan(0);
    expect(el.textContent).toContain('COT-0001');
  });

  it('cotiza a un cliente nuevo y calcula el total por estudiante', async () => {
    ui.boton('Nueva cotización').click();
    await estabilizar(fixture);
    ui.boton('No, es un cliente nuevo').click();
    await estabilizar(fixture);
    ui.escribir('nombreAcudiente', 'Cliente Nuevo');
    const nombre = el.querySelector('input[aria-label="Nombre del estudiante"]') as HTMLInputElement;
    for (const estudiante of ['Ana', 'Luis']) {
      nombre.value = estudiante;
      nombre.dispatchEvent(new Event('input'));
      ui.boton('Agregar estudiante').click();
      await estabilizar(fixture);
    }
    ui.escribir('valorPorEstudiante', '400000');
    await estabilizar(fixture);
    const modal = el.querySelector('app-modal') as HTMLElement;
    expect(modal.textContent?.replace(/\s/g, '')).toMatch(/800[.,]000/); // total = 400.000 × 2

    ui.boton('Registrar cotización').click();
    await estabilizar(fixture, 3);
    expect(el.textContent).toContain('Cliente Nuevo');
  });
});
