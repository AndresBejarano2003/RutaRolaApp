import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { estabilizar, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import DashboardPage from './dashboard-page';

describe('DashboardPage (inicio)', () => {
  beforeEach(() => {
    localStorage.clear();
    simularDialogos();
  });

  it('muestra indicadores, pendientes, agenda y pagos con los datos de los módulos', async () => {
    TestBed.configureTestingModule({ imports: [DashboardPage], providers: [provideRouter([]), ...repositoriosDePrueba()] });
    const fixture = TestBed.createComponent(DashboardPage);
    await estabilizar(fixture, 6);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[role="alert"].alert-error')).toBeNull();
    for (const texto of ['Cartera vencida', 'Estudiantes activos', 'Requiere atención', 'Facturado vs recaudado', 'Últimos pagos', 'Ocupación de rutas']) {
      expect(el.textContent).toContain(texto);
    }
    // Los datos de ejemplo tienen morosos y pagos registrados.
    expect(el.textContent).toContain('Acudientes en mora');
    expect(el.textContent).toContain('REC-');
    // Accesos rápidos abren el formulario de creación de la pantalla destino.
    const registrar = [...el.querySelectorAll('a')].find((a) => a.textContent?.includes('Registrar pago'));
    expect(registrar?.getAttribute('href')).toContain('accion=nuevo');
  });
});
