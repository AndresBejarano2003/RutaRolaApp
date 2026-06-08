import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-programacion-facturacion-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './programacion-facturacion-page.component.html'
})
export default class ProgramacionFacturacionPageComponent {

  nombreAcudiente: any = "Andrés Bejarano";
  // ============================
  // FILTROS
  // ============================

  filtroNombre = '';
  filtroEstado = '';
  filtroTipo = '';

  // ============================
  // CHECKS
  // ============================

  whatsappActivo = signal(false);
  emailActivo = signal(false);

  // ============================
  // FORMULARIO PRINCIPAL
  // ============================

  programacion = {
    nombre: '',
    contratacion: '',
    diaLimite: 5,
    diasPrevios: 3
  };

  // ============================
  // MENSAJES WHATSAPP
  // ============================

  mensajeWhatsapp = {
    mensaje: '',
    estado: 'Activo'
  };

  mensajesWhatsapp = signal([
    {
      id: 1,
      mensaje:
        'Hola {{nombreAcudiente}}, adjuntamos la factura correspondiente al servicio de transporte escolar.',
      estado: 'En uso'
    },
    {
      id: 2,
      mensaje:
        'Recuerda realizar el pago antes de la fecha límite.',
      estado: 'Activo'
    }
  ]);

  // ============================
  // CORREOS
  // ============================

  correo = {
    asunto: '',
    cuerpo: '',
    estado: 'Activo'
  };

  correos = signal([
    {
      id: 1,
      asunto: 'Factura mensual RutaRola',
      estado: 'En uso'
    }
  ]);

  // ============================
  // TABLA PRINCIPAL
  // ============================

  programaciones = signal([
    {
      id: 1,
      nombre: 'Mensualidad Transporte',
      factura: 'FAC-2026-001',
      diaLimite: 5,
      diasPrevios: 3,
      historial: 24,
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'Servicios Complementarios',
      factura: 'FAC-2026-002',
      diaLimite: 10,
      diasPrevios: 5,
      historial: 12,
      estado: 'Activo'
    }
  ]);

  // ============================
  // COMBOS
  // ============================

  contrataciones = [
    {
      id: 1,
      nombre: 'Contrato Ruta Norte'
    },
    {
      id: 2,
      nombre: 'Contrato Ruta Sur'
    }
  ];

  diasMes = Array.from(
    { length: 31 },
    (_, i) => i + 1
  );

  diasPrevios = Array.from(
    { length: 10 },
    (_, i) => i + 1
  );

  // ============================
  // MÉTODOS
  // ============================

  guardarProgramacion() {

    console.log('Programación guardada');

    console.log(this.programacion);

    console.log(this.mensajeWhatsapp);

    console.log(this.correo);

  }

  guardarMensajeWhatsapp() {

    const nuevo = {
      id: Date.now(),
      mensaje: this.mensajeWhatsapp.mensaje,
      estado: this.mensajeWhatsapp.estado
    };

    this.mensajesWhatsapp.update(lista => [
      ...lista,
      nuevo
    ]);

    this.mensajeWhatsapp = {
      mensaje: '',
      estado: 'Activo'
    };

  }

  guardarCorreo() {

    const nuevo = {
      id: Date.now(),
      asunto: this.correo.asunto,
      estado: this.correo.estado
    };

    this.correos.update(lista => [
      ...lista,
      nuevo
    ]);

    this.correo = {
      asunto: '',
      cuerpo: '',
      estado: 'Activo'
    };

  }

  eliminarMensajeWhatsapp(id: number) {

    this.mensajesWhatsapp.update(lista =>
      lista.filter(x => x.id !== id)
    );

  }

  eliminarCorreo(id: number) {

    this.correos.update(lista =>
      lista.filter(x => x.id !== id)
    );

  }

  activarWhatsapp() {

    this.whatsappActivo.set(
      !this.whatsappActivo()
    );

  }

  activarEmail() {

    this.emailActivo.set(
      !this.emailActivo()
    );

  }

}