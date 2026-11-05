import { Signal, computed, signal } from '@angular/core';
import { TAMANOS_PAGINA } from '../crud/listado-store';

/**
 * Paginación en el cliente para listas ya cargadas (reportes). Se usa con
 * `<app-paginacion>`: `[pagina]="p.pagina()" [tamano]="p.tamano()" [total]="p.total()"
 * [totalPaginas]="p.totalPaginas()" (cambiarPagina)="p.irA($event)" (cambiarTamano)="p.cambiarTamano($event)"`.
 */
export class PaginacionLocal<T> {
  readonly pagina = signal(1);
  readonly tamano = signal<number>(TAMANOS_PAGINA[0]);
  readonly total = computed(() => this.origen().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamano())));
  readonly visibles = computed(() => {
    const pagina = Math.min(this.pagina(), this.totalPaginas());
    const inicio = (pagina - 1) * this.tamano();
    return this.origen().slice(inicio, inicio + this.tamano());
  });

  constructor(private readonly origen: Signal<T[]>) {}

  irA(pagina: number): void {
    this.pagina.set(Math.min(Math.max(1, pagina), this.totalPaginas()));
  }

  cambiarTamano(tamano: number): void {
    this.tamano.set(tamano);
    this.pagina.set(1);
  }

  reiniciar(): void {
    this.pagina.set(1);
  }
}
