import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  it('rechaza credenciales vacías', () => {
    expect(service.iniciarSesion({ usuario: ' ', contrasena: '' })).toBe(false);
  });

  it('acepta credenciales con contenido', () => {
    expect(service.iniciarSesion({ usuario: 'admin@rutarola.com', contrasena: 'x' })).toBe(true);
  });
});
