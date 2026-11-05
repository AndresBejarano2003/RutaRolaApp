import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthService } from 'src/app/core/auth';
import { estabilizar, repositoriosDePrueba } from 'src/app/shared/pruebas/pruebas';
import LoginPage from './login-page';

@Component({ template: '' })
class Vacia {}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: LoginPage },
          { path: '**', component: Vacia },
        ]),
        ...repositoriosDePrueba(),
      ],
    });
  });

  async function ingresar(usuario: string, contrasena = 'rutarola'): Promise<HTMLElement> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login', LoginPage);
    await estabilizar(harness.fixture);
    const el = harness.routeNativeElement as HTMLElement;
    const escribir = (control: string, valor: string) => {
      const campo = el.querySelector(`input[formcontrolname="${control}"]`) as HTMLInputElement;
      campo.value = valor;
      campo.dispatchEvent(new Event('input'));
    };
    escribir('usuario', usuario);
    escribir('contrasena', contrasena);
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await estabilizar(harness.fixture, 4);
    return el;
  }

  it('lleva al administrador al sistema administrativo', async () => {
    await ingresar('admin');
    expect(TestBed.inject(Router).url).toBe('/inicio');
    expect(TestBed.inject(AuthService).rol()).toBe('ADMINISTRADOR');
  });

  it('lleva al conductor a la ruta del día', async () => {
    await ingresar('jcardenas');
    expect(TestBed.inject(Router).url).toBe('/ruta-del-dia');
    expect(TestBed.inject(AuthService).sesion()?.empleadoId).toBe('emp-1');
  });

  it('no deja entrar con una contraseña equivocada', async () => {
    const el = await ingresar('jcardenas', 'equivocada');
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Usuario o contraseña incorrectos');
    expect(TestBed.inject(Router).url).toBe('/login');
    // La contraseña se vacía para que el siguiente intento no se sume a lo que había.
    expect((el.querySelector('input[formcontrolname="contrasena"]') as HTMLInputElement).value).toBe('');
    expect((el.querySelector('input[formcontrolname="usuario"]') as HTMLInputElement).value).toBe('jcardenas');
  });

  it('muestra el motivo cuando el empleado está inactivo', async () => {
    const el = await ingresar('rpolania');
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('inactivo');
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('en modo local ofrece un acceso de prueba por tipo de usuario', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login', LoginPage);
    await estabilizar(harness.fixture, 3);
    const texto = (harness.routeNativeElement as HTMLElement).textContent ?? '';
    for (const rol of ['Administrador', 'Conductor', 'Monitora', 'Acudiente']) expect(texto).toContain(rol);
  });
});
