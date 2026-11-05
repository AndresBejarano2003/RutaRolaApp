import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import ProgramacionPage from './programacion-page';

describe('ProgramacionPage', () => {
  let fixture: ComponentFixture<ProgramacionPage>;
  let el: HTMLElement;
  let ui: ReturnType<typeof pantalla>;

  beforeEach(async () => {
    localStorage.clear();
    simularDialogos();
    TestBed.configureTestingModule({ imports: [ProgramacionPage], providers: [provideRouter([]), ...repositoriosDePrueba()] });
    fixture = TestBed.createComponent(ProgramacionPage);
    el = fixture.nativeElement;
    ui = pantalla(el);
    await estabilizar(fixture, 3);
  });

  it('lista las programaciones con su factura e historial de envíos', async () => {
    expect(ui.filas('app-programaciones-tabla').length).toBe(3);
    expect(el.textContent).toContain('FAC-0001');
    (el.querySelector('button[aria-label^="Historial de envíos"]') as HTMLButtonElement).click();
    await estabilizar(fixture, 3);
    expect(el.textContent).toContain('Mes cobrado');
  });

  it('exige un mensaje de WhatsApp "En uso" y luego registra', async () => {
    ui.boton('Nueva programación').click();
    await estabilizar(fixture);
    ui.escribir('nombre', 'Cobro Samuel');
    ui.elegir('facturaId', 'FAC-0003');
    ui.elegir('diaLimitePago', 'Día 10');
    ui.elegir('diasPrevios', '3 días');
    const whatsapp = el.querySelector('input[formcontrolname="whatsapp"]') as HTMLInputElement;
    whatsapp.click();
    await estabilizar(fixture);

    ui.boton('Registrar programación').click();
    await estabilizar(fixture);
    expect(el.querySelector('app-modal')?.textContent).toContain('márcalo "En uso"');

    // El panel se abrió solo: se registra un mensaje "En uso".
    ui.boton('Nuevo mensaje').click();
    await estabilizar(fixture);
    const cuerpo = el.querySelector('app-plantillas-mensaje textarea') as HTMLTextAreaElement;
    cuerpo.value = 'Hola {acudiente}, recuerda pagar {valor}.';
    cuerpo.dispatchEvent(new Event('input'));
    ui.elegir('estado', 'En uso', el.querySelector('app-plantillas-mensaje') as HTMLElement);
    await estabilizar(fixture);
    ui.boton('Agregar mensaje').click();
    await estabilizar(fixture);

    ui.boton('Registrar programación').click();
    await estabilizar(fixture, 3);
    expect(el.textContent).toContain('Cobro Samuel');
    expect(ui.filas('app-programaciones-tabla').length).toBe(4);
  });
});
