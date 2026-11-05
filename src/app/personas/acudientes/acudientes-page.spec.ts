import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import AcudientesPage from './acudientes-page';

describe('AcudientesPage', () => {
  let fixture: ComponentFixture<AcudientesPage>;
  let el: HTMLElement;
  let ui: ReturnType<typeof pantalla>;

  const accionEnFila = (nombre: string, accion: string) => {
    const fila = [...el.querySelectorAll('app-acudientes-tabla tbody tr')].find((f) => f.textContent?.includes(nombre));
    (fila?.querySelector(`button[aria-label="${accion}"]`) as HTMLButtonElement).click();
  };

  beforeEach(async () => {
    localStorage.clear();
    simularDialogos();
    TestBed.configureTestingModule({
      imports: [AcudientesPage],
      providers: [provideRouter([]), ...repositoriosDePrueba()],
    });
    fixture = TestBed.createComponent(AcudientesPage);
    el = fixture.nativeElement;
    ui = pantalla(el);
    await estabilizar(fixture);
  });

  it('lista los acudientes ordenados por apellido', () => {
    expect(el.textContent).toContain('8 registros');
    expect(ui.filas('app-acudientes-tabla')[0].textContent).toContain('Andrea Castillo Ortiz');
  });

  it('filtra por nombre', async () => {
    const buscar = el.querySelector('app-acudientes-filtros input[type="search"]') as HTMLInputElement;
    buscar.value = 'quintero';
    buscar.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 350));
    await estabilizar(fixture);
    expect(el.textContent).toContain('1 registro');
  });

  it('muestra los estudiantes a cargo', async () => {
    accionEnFila('María Pérez López', 'Estudiantes a cargo');
    await estabilizar(fixture, 3);
    const modal = [...el.querySelectorAll('app-modal')].find((m) => m.textContent?.includes('Estudiantes a cargo'))!;
    expect(modal.textContent).toContain('Juan Sebastián Pérez López');
    expect(modal.textContent).toContain('Valentina Pérez López');
  });

  it('no permite eliminar un acudiente con estudiantes a cargo', async () => {
    accionEnFila('María Pérez López', 'Eliminar');
    await estabilizar(fixture, 3);
    const dialogo = el.querySelector('app-dialogo-confirmacion') as HTMLElement;
    expect(dialogo.textContent).toContain('tiene 2 estudiante(s) a cargo');
    expect(dialogo.querySelector('button.btn-error')).toBeNull();
  });

  it('elimina un acudiente sin estudiantes a cargo', async () => {
    accionEnFila('Paola Andrea Silva Torres', 'Eliminar');
    await estabilizar(fixture, 3);
    (el.querySelector('app-dialogo-confirmacion button.btn-error') as HTMLButtonElement).click();
    await estabilizar(fixture, 3);
    expect(el.textContent).toContain('7 registros');
  });

  it('registra un acudiente validando el teléfono', async () => {
    ui.boton('Nuevo acudiente').click();
    await estabilizar(fixture);
    ui.elegir('tipoDocumento', 'cedula de ciu');
    ui.escribir('numeroDocumento', '1075999888');
    ui.escribir('primerNombre', 'Ana');
    ui.escribir('primerApellido', 'Arias');
    ui.escribir('telefono', '12');
    ui.boton('Registrar acudiente').click();
    await estabilizar(fixture);
    expect(el.textContent).toContain('Ingresa un teléfono válido');

    ui.escribir('telefono', '300 555 1234');
    ui.boton('Registrar acudiente').click();
    await estabilizar(fixture, 3);
    expect(el.textContent).toContain('9 registros');
    expect(el.textContent).toContain('Ana Arias');
  });
});
