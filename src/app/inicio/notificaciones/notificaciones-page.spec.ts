import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { VehiculosRepositorio } from 'src/app/operacion/vehiculos/vehiculos-repositorio';
import { CampanaNotificaciones } from 'src/app/layout/campana-notificaciones/campana-notificaciones';
import { CambiosDatos } from 'src/app/shared/crud/cambios-datos';
import { estabilizar, pantalla, repositoriosDePrueba, simularDialogos } from 'src/app/shared/pruebas/pruebas';
import { FILTROS_NOTIFICACION_VACIOS } from './notificacion-sistema';
import { NotificacionesRepositorio } from './notificaciones-repositorio';
import NotificacionesPage from './notificaciones-page';

function configurar() {
  TestBed.configureTestingModule({ providers: [provideRouter([]), ...repositoriosDePrueba()] });
}

async function crearPagina() {
  configurar();
  const fixture = TestBed.createComponent(NotificacionesPage);
  await estabilizar(fixture, 6);
  const el = fixture.nativeElement as HTMLElement;
  const items = () => el.querySelectorAll('ul li.rounded-box');
  /** Total del listado (todas las páginas), según el texto "N notificaciones". */
  const total = () => Number(/(\d+) notificaci/.exec(el.textContent ?? '')?.[1] ?? 0);
  return { fixture, el, items, total, ui: pantalla(el) };
}

describe('Notificaciones (modo local)', () => {
  beforeEach(() => {
    localStorage.clear();
    simularDialogos();
  });

  it('genera notificaciones a partir de los datos y no repite las eliminadas', async () => {
    configurar();
    const repo = TestBed.inject(NotificacionesRepositorio);
    const resumen = await firstValueFrom(repo.resumen());
    expect(resumen.recientes.length).toBeGreaterThan(0);
    expect(resumen.noLeidas).toBeGreaterThan(0);

    const todas = await firstValueFrom(repo.listar(FILTROS_NOTIFICACION_VACIOS, { pagina: 1, tamano: 500 }));
    await firstValueFrom(repo.eliminar([todas.items[0].id]));
    TestBed.inject(CambiosDatos).notificar(); // fuerza una nueva revisión de los datos
    await firstValueFrom(repo.resumen());
    const despues = await firstValueFrom(repo.listar(FILTROS_NOTIFICACION_VACIOS, { pagina: 1, tamano: 500 }));
    expect(despues.total).toBe(todas.total - 1);
    expect(despues.items.some((n) => n.clave === todas.items[0].clave)).toBe(false);
  });

  it('al registrar un vehículo con el SOAT vencido aparecen el registro y la alerta', async () => {
    configurar();
    const repo = TestBed.inject(NotificacionesRepositorio);
    await firstValueFrom(repo.resumen());
    await firstValueFrom(
      TestBed.inject(VehiculosRepositorio).crear({
        placa: 'NEW123',
        numeroInterno: '999',
        tipo: 'BUS',
        marca: 'Hino',
        linea: 'AK',
        modelo: 2024,
        color: 'Amarillo',
        capacidad: 40,
        vencimientoSoat: '2020-01-01',
        vencimientoTecnomecanica: '2099-01-01',
        vencimientoTarjetaOperacion: '2099-01-01',
        vencimientoPolizas: '2099-01-01',
        estado: 'ACTIVO',
        observaciones: '',
      }),
    );
    TestBed.inject(CambiosDatos).notificar(); // lo hace CrudStore al guardar
    const { recientes } = await firstValueFrom(repo.resumen());
    const titulos = recientes.map((n) => n.titulo);
    expect(titulos).toContain('Vehículo registrado · NEW123');
    expect(titulos).toContain('SOAT vencido · NEW123');
  });

  it('la campana muestra el conteo de no leídas', async () => {
    configurar();
    const fixture = TestBed.createComponent(CampanaNotificaciones);
    await estabilizar(fixture, 6);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.indicator-item')?.textContent?.trim()).toMatch(/^\d+\+?$/);
    expect(el.querySelectorAll('li').length).toBeGreaterThan(0);
    expect(el.textContent).toContain('Ver todas las notificaciones');
  });

  it('lista, expande (marca leída), archiva y restaura', async () => {
    const { fixture, el, items, total, ui } = await crearPagina();
    const inicial = total();
    expect(items().length).toBeGreaterThan(0);

    (items()[0].querySelector('button[aria-expanded]') as HTMLButtonElement).click();
    await estabilizar(fixture, 4);
    expect(items()[0].querySelector('dl')).not.toBeNull();
    expect(items()[0].textContent).toContain('Marcar como no leída');

    (items()[0].querySelector('button[aria-label="Archivar"]') as HTMLButtonElement).click();
    await estabilizar(fixture, 4);
    expect(total()).toBe(inicial - 1);

    ui.boton('Archivadas').click();
    await estabilizar(fixture, 4);
    expect(items().length).toBe(1);
    (items()[0].querySelector('button[aria-label="Restaurar"]') as HTMLButtonElement).click();
    await estabilizar(fixture, 4);
    expect(el.textContent).toContain('No tienes notificaciones archivadas.');
  });

  it('elimina una, filtra por prioridad y vacía la bandeja con confirmación', async () => {
    const { fixture, el, items, total, ui } = await crearPagina();
    const inicial = total();

    (items()[0].querySelector('button[aria-label="Eliminar"]') as HTMLButtonElement).click();
    await estabilizar(fixture, 4);
    expect(total()).toBe(inicial - 1);

    ui.elegir('nivel', 'Crítica', el.querySelector('form') as HTMLElement);
    await new Promise((r) => setTimeout(r, 350));
    await estabilizar(fixture, 4);
    expect([...items()].every((li) => li.textContent?.includes('Crítica'))).toBe(true);

    ui.boton('Vaciar bandeja').click();
    await estabilizar(fixture);
    expect(el.textContent).toContain('¿Vaciar la bandeja de entrada?');
    [...el.querySelectorAll('app-dialogo-confirmacion button')].find((b) => b.textContent?.trim() === 'Vaciar')!.dispatchEvent(new Event('click'));
    await estabilizar(fixture, 4);
    expect(items().length).toBe(0);
  });

  it('acciones sobre varias seleccionadas', async () => {
    const { fixture, el, items, ui } = await crearPagina();
    (el.querySelector('input[aria-label="Seleccionar todas las de esta página"]') as HTMLInputElement).click();
    await estabilizar(fixture);
    expect(el.textContent).toMatch(/\d+ seleccionadas?/);

    ui.boton('Marcar leídas').click();
    await estabilizar(fixture, 4);
    expect([...items()].some((li) => li.textContent?.includes('Sin leer'))).toBe(false);
  });
});
