import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectorBusqueda } from './selector-busqueda';

@Component({
  imports: [ReactiveFormsModule, SelectorBusqueda],
  template: `<app-selector-busqueda [formControl]="control" [opciones]="opciones" textoTodos="Todos los colegios" />`,
})
class Anfitrion {
  control = new FormControl('', { nonNullable: true });
  opciones = [
    { id: 'col-1', nombre: 'Colegio San Cayetano' },
    { id: 'col-3', nombre: 'Colegio La Gaitana' },
    { id: 'col-5', nombre: 'Colegio San José' },
  ];
}

describe('SelectorBusqueda', () => {
  let fixture: ComponentFixture<Anfitrion>;
  let campo: HTMLInputElement;
  const opciones = () => [...fixture.nativeElement.querySelectorAll('li[role="option"]')] as HTMLElement[];
  const tecla = (key: string) => {
    campo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };
  const escribir = (texto: string) => {
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Anfitrion);
    fixture.detectChanges();
    campo = fixture.nativeElement.querySelector('input');
    campo.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  });

  it('al enfocar muestra la opción "Todos" y todas las opciones', () => {
    expect(opciones().map((o) => o.textContent?.trim())).toEqual([
      'Todos los colegios',
      'Colegio San Cayetano',
      'Colegio La Gaitana',
      'Colegio San José',
    ]);
  });

  it('filtra al escribir sin importar tildes ni mayúsculas', () => {
    escribir('SAN JOSE');
    expect(opciones().map((o) => o.textContent?.trim())).toEqual(['Colegio San José']);
  });

  it('muestra un aviso cuando no hay resultados', () => {
    escribir('xyz');
    expect(opciones().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Sin resultados para "xyz"');
  });

  it('selecciona con el teclado y actualiza el formulario', () => {
    escribir('san');
    tecla('ArrowDown');
    tecla('Enter');
    expect(fixture.componentInstance.control.value).toBe('col-5');
    expect(campo.value).toBe('Colegio San José');
    expect(opciones().length).toBe(0);
  });

  it('selecciona con clic y permite quitar la selección', () => {
    opciones()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('col-3');

    (fixture.nativeElement.querySelector('button[aria-label="Quitar selección"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('');
  });

  it('refleja el valor escrito desde el formulario y respeta deshabilitado', () => {
    fixture.componentInstance.control.setValue('col-1');
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(campo.value).toBe('Colegio San Cayetano');
    expect(campo.disabled).toBe(true);
  });
});
