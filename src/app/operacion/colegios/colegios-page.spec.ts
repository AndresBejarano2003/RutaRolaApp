import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import ColegiosPage from './colegios-page';

describe('ColegiosPage', () => {
  let fixture: ComponentFixture<ColegiosPage>;
  let el: HTMLElement;
  let ui: ReturnType<typeof pantalla>;

  beforeEach(async () => {
    localStorage.clear();
    simularDialogos();
    TestBed.configureTestingModule({ imports: [ColegiosPage], providers: [provideRouter([]), ...repositoriosDePrueba()] });
    fixture = TestBed.createComponent(ColegiosPage);
    el = fixture.nativeElement;
    ui = pantalla(el);
    await estabilizar(fixture);
  });

  it('lista los colegios', () => {
    expect(ui.filas('app-colegios-tabla').length).toBe(5);
    expect(el.textContent).toContain('Colegio San Cayetano');
  });

  it('genera los cursos desde Jardín hasta el elegido y registra el colegio', async () => {
    ui.boton('Nuevo colegio').click();
    await estabilizar(fixture);
    ui.boton('Registrar colegio').click();
    await estabilizar(fixture);
    expect(el.querySelector('app-modal')?.textContent).toContain('obligatorio');

    ui.escribir('nit', '900123456-7');
    ui.escribir('razonSocial', 'Colegio de Prueba');
    ui.escribir('direccion', 'Calle 1 # 2-3');
    ui.elegir('hasta', '2°');
    ui.escribir('horaEntrada', '06:30');
    ui.escribir('horaSalida', '12:30');
    ui.boton('Agregar cursos').click();
    await estabilizar(fixture);
    const cursos = el.querySelectorAll('app-cursos-colegio tbody tr');
    expect(cursos.length).toBe(4); // Jardín, Transición, 1°, 2°
    expect(cursos[0].textContent).toContain('Jardín');

    ui.boton('Registrar colegio').click();
    await estabilizar(fixture, 3);
    expect(el.textContent).toContain('Colegio de Prueba');
    expect(el.textContent).toContain('6 registros');
  });

  it('impide eliminar un colegio con estudiantes', async () => {
    (el.querySelector('app-colegios-tabla button[aria-label="Eliminar"]') as HTMLButtonElement).click();
    await estabilizar(fixture, 3);
    const dialogo = el.querySelector('app-dialogo-confirmacion') as HTMLElement;
    expect(dialogo.textContent).toContain('Entendido');
  });
});
