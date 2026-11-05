import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatosRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { AccionesFormulario } from 'src/app/shared/acciones-formulario/acciones-formulario';
import { DialogoConfirmacion } from 'src/app/shared/dialogo-confirmacion/dialogo-confirmacion';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { Estudiante, nombreCompleto } from './estudiante';
import { EstudianteFormulario } from './estudiante-formulario/estudiante-formulario';
import { EstudiantesFiltros } from './estudiantes-filtros/estudiantes-filtros';
import { EstudiantesStore } from './estudiantes-store';
import { EstudiantesTabla } from './estudiantes-tabla/estudiantes-tabla';

const TITULOS: Record<ModoFormulario, string> = {
  crear: 'Nuevo estudiante',
  editar: 'Editar estudiante',
  consultar: 'Detalle del estudiante',
};

@Component({
  selector: 'app-estudiantes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EstudiantesFiltros,
    EstudiantesTabla,
    EstudianteFormulario,
    AccionesFormulario,
    Modal,
    DialogoConfirmacion,
    Paginacion,
  ],
  providers: [EstudiantesStore],
  templateUrl: './estudiantes-page.html',
})
export default class EstudiantesPage {
  protected readonly store = inject(EstudiantesStore);

  // Modal de crear / editar / consultar
  protected readonly modalAbierto = signal(false);
  protected readonly modo = signal<ModoFormulario>('crear');
  protected readonly seleccionado = signal<Estudiante | null>(null);
  protected readonly cargandoDetalle = signal(false);
  protected readonly tituloModal = computed(() => TITULOS[this.modo()]);
  protected readonly subtituloModal = computed(() => {
    const estudiante = this.seleccionado();
    return estudiante && this.modo() !== 'crear' ? nombreCompleto(estudiante) : '';
  });

  // Confirmación de eliminación
  protected readonly confirmacionAbierta = signal(false);
  protected readonly porEliminar = signal<Estudiante | null>(null);
  protected readonly mensajeEliminar = computed(() => {
    const estudiante = this.porEliminar();
    return estudiante
      ? `Se eliminará a ${nombreCompleto(estudiante)} (${estudiante.tipoDocumento} ${estudiante.numeroDocumento}). Esta acción no se puede deshacer.`
      : '';
  });

  constructor() {
    this.store.recargar();
  }

  protected nuevo(): void {
    this.modo.set('crear');
    this.seleccionado.set(null);
    this.modalAbierto.set(true);
  }

  protected async abrir(modo: 'consultar' | 'editar', estudiante: Estudiante): Promise<void> {
    this.modo.set(modo);
    this.seleccionado.set(estudiante);
    this.modalAbierto.set(true);

    // Trae el registro completo (con el API puede tener más datos que el listado).
    this.cargandoDetalle.set(true);
    const detalle = await this.store.obtener(estudiante.id);
    this.cargandoDetalle.set(false);
    if (detalle) {
      this.seleccionado.set(detalle);
    } else {
      this.modalAbierto.set(false);
      this.store.recargar();
    }
  }

  protected async guardar(datos: DatosRegistro<Estudiante>): Promise<void> {
    const id = this.modo() === 'editar' ? (this.seleccionado()?.id ?? null) : null;
    if (await this.store.guardar(datos, id)) {
      this.modalAbierto.set(false);
    }
  }

  protected pedirEliminar(estudiante: Estudiante): void {
    this.porEliminar.set(estudiante);
    this.confirmacionAbierta.set(true);
  }

  protected async confirmarEliminar(): Promise<void> {
    const estudiante = this.porEliminar();
    if (estudiante && (await this.store.eliminar(estudiante.id))) {
      this.confirmacionAbierta.set(false);
    }
  }
}
