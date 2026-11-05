import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import EmpleadosPage from './empleados-page';

describe('EmpleadosPage', () => {
  let fixture: ComponentFixture<EmpleadosPage>;
  let el: HTMLElement;
  let ui: ReturnType<typeof pantalla>;

  beforeEach(async () => {
    localStorage.clear();
    simularDialogos();
    TestBed.configureTestingModule({
      imports: [EmpleadosPage],
      providers: [provideRouter([]), ...repositoriosDePrueba()],
    });
    fixture = TestBed.createComponent(EmpleadosPage);
    el = fixture.nativeElement;
    ui = pantalla(el);
    await estabilizar(fixture);
  });

  it('lista empleados con sueldo y estado de licencia', () => {
    expect(el.textContent).toContain('8 registros');
    expect(el.textContent).toMatch(/2[.,]200[.,]000/);
    expect(el.textContent).toContain('Vencida');
    expect(el.textContent).toContain('Por vencer');
  });

  it('filtra por tipo de empleado', async () => {
    ui.elegir('tipoEmpleado', 'monit', el.querySelector('app-empleados-filtros') as HTMLElement);
    await new Promise((r) => setTimeout(r, 350));
    await estabilizar(fixture);
    expect(el.textContent).toContain('3 registros');
  });

  it('pide la licencia solo a los conductores', async () => {
    ui.boton('Nuevo empleado').click();
    await estabilizar(fixture);
    const licencia = () => el.querySelector('[formcontrolname="numeroLicencia"]');

    ui.elegir('tipoEmpleado', 'monitora');
    await estabilizar(fixture);
    expect(licencia()).toBeNull();

    ui.elegir('tipoEmpleado', 'conductor');
    await estabilizar(fixture);
    expect(licencia()).not.toBeNull();
  });

  it('registra un conductor con su licencia', async () => {
    ui.boton('Nuevo empleado').click();
    await estabilizar(fixture);
    ui.elegir('tipoDocumento', 'cedula de ciu');
    ui.escribir('numeroDocumento', '1075111222');
    ui.escribir('primerNombre', 'Mario');
    ui.escribir('primerApellido', 'Álvarez');
    ui.elegir('tipoEmpleado', 'conductor');
    await estabilizar(fixture);
    ui.escribir('fechaIngreso', '2026-01-15');
    ui.elegir('tipoContrato', 'indefinido');
    ui.escribir('sueldo', '2300000');
    ui.escribir('telefono', '3009998877');

    ui.boton('Registrar empleado').click();
    await estabilizar(fixture);
    expect(el.textContent).toContain('Este campo es obligatorio.'); // falta la licencia

    ui.escribir('numeroLicencia', '1075111222');
    ui.elegir('categoriaLicencia', 'C2');
    ui.escribir('vencimientoLicencia', '2030-12-31');
    ui.boton('Registrar empleado').click();
    await estabilizar(fixture, 3);

    expect(el.textContent).toContain('9 registros');
    expect(el.textContent).toContain('Mario Álvarez');
  });
});
