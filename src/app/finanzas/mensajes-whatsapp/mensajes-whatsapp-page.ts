import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AcudientesRepositorio } from 'src/app/personas/acudientes/acudientes-repositorio';
import { EncabezadoListado } from 'src/app/shared/encabezado-listado/encabezado-listado';
import { EstadoVacio } from 'src/app/shared/estado-vacio/estado-vacio';
import { emitirEnVivo } from 'src/app/shared/formularios/formularios';
import { Modal } from 'src/app/shared/modal/modal';
import { Paginacion } from 'src/app/shared/paginacion/paginacion';
import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import {
  ESTADOS_MENSAJE_WHATSAPP,
  EstadoMensajeWhatsapp,
  FILTROS_MENSAJE_WHATSAPP_VACIOS,
  FiltrosMensajeWhatsapp,
  MensajeWhatsapp,
} from './mensaje-whatsapp';
import { MensajesWhatsappStore } from './mensajes-whatsapp-store';

/**
 * Registro de los recordatorios de cobro que el servidor envió por WhatsApp (solo lectura): a quién,
 * qué texto, cuándo y si el proveedor lo aceptó. Los mensajes se configuran en Programación de facturación.
 */
@Component({
  selector: 'app-mensajes-whatsapp-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, RouterLink, SelectorBusqueda, EncabezadoListado, Paginacion, Modal, EstadoVacio],
  providers: [MensajesWhatsappStore],
  templateUrl: './mensajes-whatsapp-page.html',
})
export default class MensajesWhatsappPage implements OnInit {
  protected readonly store = inject(MensajesWhatsappStore);
  protected readonly estados = ESTADOS_MENSAJE_WHATSAPP;
  protected readonly acudientes = toSignal(inject(AcudientesRepositorio).opciones(), { initialValue: [] });

  protected readonly filtros = inject(NonNullableFormBuilder).group({
    texto: FILTROS_MENSAJE_WHATSAPP_VACIOS.texto,
    acudienteId: FILTROS_MENSAJE_WHATSAPP_VACIOS.acudienteId,
    estado: FILTROS_MENSAJE_WHATSAPP_VACIOS.estado as EstadoMensajeWhatsapp | '',
    desde: FILTROS_MENSAJE_WHATSAPP_VACIOS.desde,
    hasta: FILTROS_MENSAJE_WHATSAPP_VACIOS.hasta,
  });

  protected readonly detalleAbierto = signal(false);
  protected readonly detalle = signal<MensajeWhatsapp | null>(null);

  constructor() {
    emitirEnVivo<FiltrosMensajeWhatsapp>(this.filtros, { emit: (f) => this.store.buscar(f) });
  }

  ngOnInit(): void {
    this.store.recargar();
  }

  protected consultar(m: MensajeWhatsapp): void {
    this.detalle.set(m);
    this.detalleAbierto.set(true);
  }

  protected estado(e: EstadoMensajeWhatsapp) {
    return this.estados.find((x) => x.id === e) ?? this.estados[0];
  }

  protected fechaHora(iso: string | null): string {
    return iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  }
}
