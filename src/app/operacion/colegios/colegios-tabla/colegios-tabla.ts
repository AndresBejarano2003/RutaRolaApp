import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AccionesFila } from 'src/app/shared/acciones-fila/acciones-fila';
import { BadgeEstado } from 'src/app/shared/badge-estado/badge-estado';
import { EstadoVacio } from 'src/app/shared/estado-vacio/estado-vacio';
import { Colegio, rangoCursos } from '../colegio';

@Component({
  selector: 'app-colegios-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccionesFila, BadgeEstado, EstadoVacio],
  template: `
    <div class="overflow-x-auto rounded-box border border-base-300">
      <table class="table">
        <thead>
          <tr class="bg-base-300 text-base-content/80 text-xs uppercase tracking-wide">
            <th>Colegio</th>
            <th>NIT</th>
            <th class="hidden md:table-cell">Teléfono</th>
            <th>Cursos</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="transition-opacity" [class.opacity-50]="cargando() && colegios().length > 0">
          @if (cargando() && colegios().length === 0) {
            @for (fila of [1, 2, 3, 4, 5]; track fila) {
              <tr class="border-base-300">
                @for (col of [1, 2, 3, 4, 5, 6]; track col) {
                  <td><div class="skeleton bg-base-300 h-4 w-full"></div></td>
                }
              </tr>
            }
          } @else {
            @for (colegio of colegios(); track colegio.id) {
              <tr class="border-base-300 hover:bg-base-300/50 cursor-pointer transition-colors" (click)="consultar.emit(colegio)">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="rounded-full w-9 h-9 grid place-items-center shrink-0"
                      [class]="colegio.estado === 'ACTIVO' ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/70'">
                      <i class="fa-solid fa-school text-sm"></i>
                    </div>
                    <div class="min-w-0">
                      <div class="font-semibold truncate">{{ colegio.razonSocial }}</div>
                      <div class="text-xs text-base-content/70 truncate">{{ colegio.direccion }}</div>
                    </div>
                  </div>
                </td>
                <td class="font-mono whitespace-nowrap">{{ colegio.nit }}</td>
                <td class="hidden md:table-cell whitespace-nowrap">{{ colegio.telefono || '—' }}</td>
                <td class="whitespace-nowrap">
                  <div class="font-medium">{{ rangoCursos(colegio.cursos) }}</div>
                  <div class="text-xs text-base-content/70">{{ activos(colegio) }} curso(s) activo(s)</div>
                </td>
                <td><app-badge-estado [estado]="colegio.estado" /></td>
                <td class="text-right whitespace-nowrap">
                  <app-acciones-fila (consultar)="consultar.emit(colegio)" (editar)="editar.emit(colegio)"
                    (eliminar)="eliminar.emit(colegio)" />
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">
                  <app-estado-vacio icono="fa-solid fa-school" mensaje="Aún no hay colegios registrados."
                    [hayFiltros]="hayFiltros()" (crear)="crear.emit()" />
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ColegiosTabla {
  readonly colegios = input.required<Colegio[]>();
  readonly cargando = input(false);
  readonly hayFiltros = input(false);

  readonly consultar = output<Colegio>();
  readonly editar = output<Colegio>();
  readonly eliminar = output<Colegio>();
  readonly crear = output<void>();

  protected readonly rangoCursos = rangoCursos;
  protected activos(colegio: Colegio): number {
    return colegio.cursos.filter((c) => c.estado === 'ACTIVO').length;
  }
}
