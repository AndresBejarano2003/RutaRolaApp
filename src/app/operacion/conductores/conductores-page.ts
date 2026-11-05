import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BadgeEstado } from 'src/app/shared/badge-estado/badge-estado';
import { CeldaPersona } from 'src/app/shared/celda-persona/celda-persona';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { EncabezadoListado } from 'src/app/shared/encabezado-listado/encabezado-listado';
import { EstadoVacio } from 'src/app/shared/estado-vacio/estado-vacio';
import { fechaCorta } from 'src/app/shared/fechas/fechas';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { BadgeVencimiento, EstadoVencimiento } from 'src/app/shared/vencimiento/vencimiento';
import { ConductorOperacion, ESTADOS_LICENCIA, FILTROS_CONDUCTOR_VACIOS, FiltrosConductor, OPCIONES_ASIGNACION } from './conductor';
import { ConductoresStore } from './conductores-store';

/**
 * Vista operativa (solo lectura) de los conductores: licencia y ruta/vehículo
 * asignados. Los datos personales se editan en Personas › Empleados y las
 * asignaciones en Operación › Asignaciones.
 */
@Component({
  selector: 'app-conductores-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, RouterLink, SelectorBusqueda, EncabezadoListado, Paginacion, Modal, CeldaPersona, BadgeEstado, BadgeVencimiento, EstadoVacio],
  providers: [ConductoresStore],
  templateUrl: './conductores-page.html',
})
export default class ConductoresPage implements OnInit {
  protected readonly store = inject(ConductoresStore);
  protected readonly licencias = ESTADOS_LICENCIA;
  protected readonly asignaciones = OPCIONES_ASIGNACION;
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly fechaCorta = fechaCorta;

  protected readonly filtros = inject(NonNullableFormBuilder).group({
    texto: FILTROS_CONDUCTOR_VACIOS.texto,
    licencia: FILTROS_CONDUCTOR_VACIOS.licencia as EstadoVencimiento | '',
    asignacion: FILTROS_CONDUCTOR_VACIOS.asignacion as FiltrosConductor['asignacion'],
    estado: FILTROS_CONDUCTOR_VACIOS.estado as EstadoRegistro | '',
  });

  protected readonly detalleAbierto = signal(false);
  protected readonly detalle = signal<ConductorOperacion | null>(null);

  constructor() {
    emitirEnVivo<FiltrosConductor>(this.filtros, { emit: (f) => this.store.buscar(f) });
  }

  ngOnInit(): void {
    this.store.recargar();
  }

  protected consultar(conductor: ConductorOperacion): void {
    this.detalle.set(conductor);
    this.detalleAbierto.set(true);
  }
}
