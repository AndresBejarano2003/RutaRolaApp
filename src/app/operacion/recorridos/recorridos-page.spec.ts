import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/auth';
import { RecorridosRepositorio } from 'src/app/ruta-del-dia/recorridos-repositorio';
import { fechaIso } from 'src/app/shared/fechas/fechas';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import RecorridosPage from './recorridos-page';

describe('RecorridosPage (historial)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    simularDialogos();
    vi.useFakeTimers({ now: new Date('2026-11-05T06:30:00'), toFake: ['Date'] });
    TestBed.configureTestingModule({ imports: [RecorridosPage], providers: [provideRouter([]), ...repositoriosDePrueba()] });
  });

  afterEach(() => vi.useRealTimers());

  /** Un conductor hace la recogida completa (con una ausencia) y otro deja su entrega en curso. */
  async function registrarRecorridos(): Promise<void> {
    const auth = TestBed.inject(AuthService);
    const repo = TestBed.inject(RecorridosRepositorio);
    const entrar = (empleadoId: string) =>
      auth.abrirSesion({ usuario: 'x', nombre: 'X', correo: '', rol: 'CONDUCTOR', empleadoId, imagen: '', inicio: '' });

    entrar('emp-1');
    const [norte] = await firstValueFrom(repo.rutasDelDia(fechaIso()));
    const r = await firstValueFrom(repo.iniciar(norte.asignacionId, 'RECOGIDA'));
    await firstValueFrom(repo.marcar(r.id, ['est-1'], 'A_BORDO'));
    await firstValueFrom(repo.marcar(r.id, ['est-2'], 'AUSENTE'));
    await firstValueFrom(repo.marcar(r.id, ['est-1'], 'ENTREGADO'));
    await firstValueFrom(repo.finalizar(r.id, 'Trancón en la 26'));

    entrar('emp-2');
    const [centro] = await firstValueFrom(repo.rutasDelDia(fechaIso()));
    await firstValueFrom(repo.iniciar(centro.asignacionId, 'ENTREGA'));
    auth.cerrarSesion();
  }

  it('lista los recorridos, filtra por novedad y muestra el detalle por estudiante', async () => {
    await registrarRecorridos();
    // Los filtros usan debounceTime, que no avanza con la fecha congelada.
    vi.useRealTimers();
    const fixture = TestBed.createComponent(RecorridosPage);
    await estabilizar(fixture, 3);
    const el = fixture.nativeElement as HTMLElement;
    const filas = () => el.querySelectorAll('tbody tr');

    expect(el.textContent).toContain('2 registros');
    expect(el.textContent).toContain('R-01 · Norte');
    expect(el.textContent).toContain('R-02 · Centro');
    expect(el.textContent).toContain('En curso');

    pantalla(el).elegir('novedad', 'no asistieron', el.querySelector('form') as HTMLElement);
    await new Promise((r) => setTimeout(r, 350));
    await estabilizar(fixture, 3);
    expect(filas()).toHaveLength(1);
    expect(filas()[0].textContent).toContain('R-01 · Norte');

    (filas()[0] as HTMLElement).click();
    await estabilizar(fixture);
    const modal = el.querySelector('app-modal') as HTMLElement;
    expect(modal.textContent).toContain('Trancón en la 26');
    expect(modal.textContent).toContain('No asistió');
    expect(modal.textContent).toContain('Entregado');
  });

  it('sin recorridos muestra el estado vacío', async () => {
    const fixture = TestBed.createComponent(RecorridosPage);
    await estabilizar(fixture, 3);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aún no hay recorridos');
  });
});
