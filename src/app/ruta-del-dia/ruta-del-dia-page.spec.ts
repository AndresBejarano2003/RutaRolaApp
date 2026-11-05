import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/auth';
import { fechaIso } from 'src/app/shared/fechas/fechas';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import RecorridoPage from './recorrido/recorrido-page';
import { RecorridosRepositorio } from './recorridos-repositorio';
import RutaDelDiaPage from './ruta-del-dia-page';

@Component({ template: '' })
class Vacia {}

describe('Ruta del día (conductor)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    simularDialogos();
    vi.useFakeTimers({ now: new Date('2026-11-05T06:30:00'), toFake: ['Date'] });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'ruta-del-dia', component: RutaDelDiaPage },
          { path: 'ruta-del-dia/recorrido/:id', component: RecorridoPage },
          { path: '**', component: Vacia },
        ]),
        ...repositoriosDePrueba(),
      ],
    });
    TestBed.inject(AuthService).abrirSesion({
      usuario: '7698123', nombre: 'José Luis Cárdenas Rojas', correo: '', rol: 'CONDUCTOR', empleadoId: 'emp-1', imagen: '', inicio: '',
    });
  });

  afterEach(() => vi.useRealTimers());

  it('lista las rutas de hoy e inicia la recogida', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/ruta-del-dia', RutaDelDiaPage);
    await estabilizar(harness.fixture, 4);
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('Buenos días, José');
    expect(el.textContent).toContain('R-01 · Norte');
    expect(el.textContent).toContain('Monitora:');
    const iniciar = pantalla(el).boton('Iniciar recogida');
    expect(iniciar.className).toContain('btn-primary');

    iniciar.click();
    await estabilizar(harness.fixture, 4);
    expect(TestBed.inject(Router).url).toMatch(/^\/ruta-del-dia\/recorrido\//);
  });

  it('guía el recorrido paso a paso hasta finalizarlo', async () => {
    const repo = TestBed.inject(RecorridosRepositorio);
    const [ruta] = await firstValueFrom(repo.rutasDelDia(fechaIso()));
    const r = await firstValueFrom(repo.iniciar(ruta.asignacionId, 'RECOGIDA'));

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/ruta-del-dia/recorrido/${r.id}`, RecorridoPage);
    await estabilizar(harness.fixture, 4);
    const el = harness.routeNativeElement as HTMLElement;
    const ui = pantalla(el);
    const paso = () => el.querySelector('[aria-live="polite"]')?.textContent ?? '';

    expect(paso()).toContain('Próxima recogida');
    expect(paso()).toContain(r.paradas[0].estudiante);
    ui.boton('Recogido').click();
    await estabilizar(harness.fixture, 3);
    expect(paso()).toContain(r.paradas[1].estudiante);
    ui.boton('No asistió').click();
    await estabilizar(harness.fixture, 3);
    expect(paso()).toContain('Llegada al colegio');
    ui.boton('en el colegio').click();
    await estabilizar(harness.fixture, 3);
    expect(paso()).toContain('Todos los estudiantes están resueltos');
    ui.boton('Finalizar recorrido').click();
    await estabilizar(harness.fixture, 3);
    expect(el.querySelector('[aria-live="polite"]')).toBeNull();
    expect(el.textContent).toContain('Finalizado');
    expect(el.textContent).toContain('100 %');
  });
});
