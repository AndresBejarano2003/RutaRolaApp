import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AccionesFila } from 'src/app/shared/acciones-fila/acciones-fila';
import { BadgeEstado } from 'src/app/shared/badge-estado/badge-estado';
import { EstadoVacio } from 'src/app/shared/estado-vacio/estado-vacio';
import { Programacion } from '../programacion';

@Component({
  selector: 'app-programaciones-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccionesFila, BadgeEstado, EstadoVacio],
  template: `
    <div class="@container overflow-x-auto rounded-box border border-base-300">
      <table class="table">
        <thead>
          <tr class="bg-base-300 text-base-content/80 text-xs uppercase tracking-wide">
            <th>Nombre</th>
            <th>No. factura</th>
            <th class="hidden @3xl:table-cell text-center">Día límite de pago</th>
            <th class="text-center hidden @3xl:table-cell">Días previos para envío</th>
            <th class="text-center">Historial de envíos</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="transition-opacity" [class.opacity-50]="cargando() && programaciones().length > 0">
          @if (cargando() && programaciones().length === 0) {
            @for (fila of [1, 2, 3]; track fila) {
              <tr class="border-base-300">
                @for (col of [1, 2, 3, 4, 5, 6, 7]; track col) {
                  <td><div class="skeleton bg-base-300 h-4 w-full"></div></td>
                }
              </tr>
            }
          } @else {
            @for (p of programaciones(); track p.id) {
              <tr class="border-base-300 hover:bg-base-300/50 cursor-pointer transition-colors" (click)="consultar.emit(p)">
                <td>
                  <div class="font-medium">{{ p.nombre }}</div>
                  <div class="flex gap-2 text-xs text-base-content/70 mt-0.5">
                    @if (p.whatsapp) {
                      <span><i class="fa-brands fa-whatsapp text-success"></i> WhatsApp</span>
                    }
                    @if (p.email) {
                      <span><i class="fa-solid fa-envelope text-info"></i> Correo</span>
                    }
                  </div>
                </td>
                <td class="font-mono whitespace-nowrap">{{ p.numeroFactura }}</td>
                <td class="hidden @3xl:table-cell text-center">Día {{ p.diaLimitePago }}</td>
                <td class="text-center hidden @3xl:table-cell">{{ p.diasPrevios }} {{ p.diasPrevios === 1 ? 'día' : 'días' }}</td>
                <td class="text-center" (click)="$event.stopPropagation()">
                  <button type="button" class="btn btn-sm btn-ghost hover:bg-base-300"
                    [attr.aria-label]="'Historial de envíos de ' + p.nombre" (click)="historial.emit(p)">
                    <i class="fa-solid fa-clock-rotate-left text-info"></i>
                    <span class="badge badge-sm bg-base-300 border-neutral">{{ conteo()[p.id] ?? 0 }}</span>
                  </button>
                </td>
                <td><app-badge-estado [estado]="p.estado" /></td>
                <td class="text-right whitespace-nowrap">
                  <app-acciones-fila (consultar)="consultar.emit(p)" (editar)="editar.emit(p)" (eliminar)="eliminar.emit(p)" />
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  <app-estado-vacio icono="fa-solid fa-calendar-check" mensaje="Aún no hay programaciones de facturación."
                    textoCrear="Registrar la primera" [hayFiltros]="hayFiltros()" (crear)="crear.emit()" />
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ProgramacionesTabla {
  readonly programaciones = input.required<Programacion[]>();
  readonly conteo = input<Partial<Record<string, number>>>({});
  readonly cargando = input(false);
  readonly hayFiltros = input(false);

  readonly consultar = output<Programacion>();
  readonly editar = output<Programacion>();
  readonly eliminar = output<Programacion>();
  readonly historial = output<Programacion>();
  readonly crear = output<void>();
}
