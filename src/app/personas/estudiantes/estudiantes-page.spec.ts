import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import EstudiantesPage from './estudiantes-page';
import { EstudiantesLocal } from './estudiantes-local';
import { EstudiantesRepositorio } from './estudiantes-repositorio';

/** Repositorio local sin latencia para las pruebas. */
class EstudiantesLocalRapido extends EstudiantesLocal {
  protected override latenciaMs = 0;
}

async function estabilizar(fixture: ComponentFixture<unknown>): Promise<void> {
  await new Promise((r) => setTimeout(r, 0));
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('EstudiantesPage', () => {
  let fixture: ComponentFixture<EstudiantesPage>;
  let el: HTMLElement;

  const filas = () => el.querySelectorAll('app-estudiantes-tabla tbody tr');
  const boton = (texto: string) =>
    [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(texto)) as HTMLButtonElement;

  beforeEach(async () => {
    localStorage.clear();
    // jsdom no implementa <dialog>.showModal/close.
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };

    TestBed.configureTestingModule({
      imports: [EstudiantesPage],
      providers: [provideRouter([]), { provide: EstudiantesRepositorio, useClass: EstudiantesLocalRapido }],
    });
    fixture = TestBed.createComponent(EstudiantesPage);
    el = fixture.nativeElement;
    await estabilizar(fixture);
  });

  it('muestra la primera página del listado y el total', () => {
    expect(filas().length).toBe(10);
    expect(el.textContent).toContain('12 registros');
    expect(el.textContent).toContain('Modo local');
  });

  it('filtra el listado escribiendo en el selector de colegio', async () => {
    const colegio = el.querySelector('app-selector-busqueda[formcontrolname="colegioId"] input') as HTMLInputElement;
    colegio.dispatchEvent(new Event('focus'));
    colegio.value = 'gaitana';
    colegio.dispatchEvent(new Event('input'));
    colegio.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await new Promise((r) => setTimeout(r, 350)); // debounce de los filtros
    await estabilizar(fixture);

    expect(el.textContent).toContain('2 registros');
    expect(colegio.value).toBe('Colegio La Gaitana');
  });

  it('muestra los botones en el pie fijo y el formulario en el cuerpo con scroll', async () => {
    boton('Nuevo estudiante').click();
    await estabilizar(fixture);

    const modal = el.querySelector('app-modal') as HTMLElement;
    const pie = modal.querySelector('footer') as HTMLElement;
    const cuerpo = modal.querySelector('.overflow-y-auto') as HTMLElement;
    expect(pie.querySelector('app-acciones-formulario')).not.toBeNull();
    expect(pie.querySelector('app-estudiante-formulario')).toBeNull();
    expect(cuerpo.querySelector('app-estudiante-formulario')).not.toBeNull();
    expect(cuerpo.querySelector('button[type="submit"]')).toBeNull();
    expect(pie.querySelector('button[type="submit"]')?.getAttribute('form')).toBe('form-estudiante');
  });

  it('valida campos obligatorios y luego registra un estudiante', async () => {
    boton('Nuevo estudiante').click();
    await estabilizar(fixture);
    expect(el.querySelector('app-estudiante-formulario')).not.toBeNull();

    boton('Registrar estudiante').click();
    await estabilizar(fixture);
    expect(el.textContent).toContain('Este campo es obligatorio.');

    const form = el.querySelector('app-estudiante-formulario') as HTMLElement;
    const escribir = (control: string, valor: string) => {
      const campo = form.querySelector(`input[formcontrolname="${control}"]`) as HTMLInputElement;
      campo.value = valor;
      campo.dispatchEvent(new Event('input'));
    };
    /** Escribe en el selector con búsqueda y elige la primera coincidencia con Enter. */
    const elegir = (control: string, texto: string) => {
      const campo = form.querySelector(`app-selector-busqueda[formcontrolname="${control}"] input`) as HTMLInputElement;
      campo.dispatchEvent(new Event('focus'));
      campo.value = texto;
      campo.dispatchEvent(new Event('input'));
      campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    };
    elegir('tipoDocumento', 'tarjeta');
    escribir('numeroDocumento', '5555555555');
    escribir('primerNombre', 'Aaron');
    escribir('primerApellido', 'Abadía');
    escribir('fechaNacimiento', '2014-02-02');
    escribir('direccion', 'Calle 5');
    elegir('acudienteId', 'maria');
    elegir('colegioId', 'cayetano');
    elegir('grado', '6°');
    elegir('jornada', 'manana');

    boton('Registrar estudiante').click();
    await estabilizar(fixture);
    await estabilizar(fixture);

    expect(el.querySelector('app-estudiante-formulario')).toBeNull();
    expect(el.textContent).toContain('13 registros');
    expect(el.textContent).toContain('Aaron Abadía');
    expect(el.textContent).toContain('María Pérez');
    expect(el.textContent).toContain('Colegio San Cayetano');
  });

  it('elimina un estudiante tras confirmar', async () => {
    (el.querySelector('button[aria-label="Eliminar"]') as HTMLButtonElement).click();
    await estabilizar(fixture);
    expect(el.textContent).toContain('Esta acción no se puede deshacer.');

    const confirmar = el.querySelector('app-dialogo-confirmacion button.btn-error') as HTMLButtonElement;
    confirmar.click();
    await estabilizar(fixture);
    await estabilizar(fixture);

    expect(el.textContent).toContain('11 registros');
  });

  it('abre la consulta en solo lectura y permite pasar a edición', async () => {
    (el.querySelector('button[aria-label="Consultar"]') as HTMLButtonElement).click();
    await estabilizar(fixture);
    const campo = () => el.querySelector('[formcontrolname="primerNombre"]') as HTMLInputElement;
    expect(campo().disabled).toBe(true);

    boton('Editar').click();
    await estabilizar(fixture);
    expect(campo().disabled).toBe(false);
    expect(el.textContent).toContain('Guardar cambios');
  });
});
