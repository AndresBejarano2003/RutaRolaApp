import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type EstadoPlantilla = 'Activo' | 'Inactivo' | 'En uso';

interface PlantillaWhatsapp {
  id: number;
  mensaje: string;
  estado: EstadoPlantilla;
}

interface PlantillaCorreo {
  id: number;
  asunto: string;
  estado: EstadoPlantilla;
}

interface Programacion {
  id: number;
  nombre: string;
  factura: string;
  diaLimite: number;
  diasPrevios: number;
  historial: number;
  estado: 'Activo' | 'Inactivo';
}

const rango = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

/** Datos de ejemplo hasta que exista el backend. */
@Component({
  selector: 'app-programacion-facturacion-page',
  imports: [FormsModule],
  templateUrl: './programacion-facturacion-page.html',
})
export default class ProgramacionFacturacionPage {
  protected readonly nombreAcudiente = 'Andrés Bejarano';

  // Filtros
  protected filtroNombre = '';
  protected filtroEstado = '';
  protected filtroTipo = '';

  // Canales de notificación
  protected readonly whatsappActivo = signal(false);
  protected readonly emailActivo = signal(false);

  // Formulario principal
  protected programacion = { nombre: '', contratacion: '', diaLimite: 5, diasPrevios: 3 };

  // Plantillas de WhatsApp
  protected mensajeWhatsapp: Omit<PlantillaWhatsapp, 'id'> = { mensaje: '', estado: 'Activo' };
  protected readonly mensajesWhatsapp = signal<PlantillaWhatsapp[]>([
    {
      id: 1,
      mensaje: 'Hola {{nombreAcudiente}}, adjuntamos la factura correspondiente al servicio de transporte escolar.',
      estado: 'En uso',
    },
    { id: 2, mensaje: 'Recuerda realizar el pago antes de la fecha límite.', estado: 'Activo' },
  ]);

  // Plantillas de correo
  protected correo = { asunto: '', cuerpo: '', estado: 'Activo' as EstadoPlantilla };
  protected readonly correos = signal<PlantillaCorreo[]>([
    { id: 1, asunto: 'Factura mensual RutaRola', estado: 'En uso' },
  ]);

  // Tabla principal
  protected readonly programaciones = signal<Programacion[]>([
    {
      id: 1,
      nombre: 'Mensualidad Transporte',
      factura: 'FAC-2026-001',
      diaLimite: 5,
      diasPrevios: 3,
      historial: 24,
      estado: 'Activo',
    },
    {
      id: 2,
      nombre: 'Servicios Complementarios',
      factura: 'FAC-2026-002',
      diaLimite: 10,
      diasPrevios: 5,
      historial: 12,
      estado: 'Activo',
    },
  ]);

  // Opciones de los select
  protected readonly contrataciones = [
    { id: 1, nombre: 'Contrato Ruta Norte' },
    { id: 2, nombre: 'Contrato Ruta Sur' },
  ];
  protected readonly diasMes = rango(31);
  protected readonly opcionesDiasPrevios = rango(10);

  protected guardarProgramacion(): void {
    // TODO: enviar al backend.
    console.log({ programacion: this.programacion, whatsapp: this.mensajeWhatsapp, correo: this.correo });
  }

  protected guardarMensajeWhatsapp(): void {
    this.mensajesWhatsapp.update((lista) => [...lista, { id: Date.now(), ...this.mensajeWhatsapp }]);
    this.mensajeWhatsapp = { mensaje: '', estado: 'Activo' };
  }

  protected guardarCorreo(): void {
    const { asunto, estado } = this.correo;
    this.correos.update((lista) => [...lista, { id: Date.now(), asunto, estado }]);
    this.correo = { asunto: '', cuerpo: '', estado: 'Activo' };
  }

  protected eliminarMensajeWhatsapp(id: number): void {
    this.mensajesWhatsapp.update((lista) => lista.filter((m) => m.id !== id));
  }

  protected eliminarCorreo(id: number): void {
    this.correos.update((lista) => lista.filter((c) => c.id !== id));
  }

  protected alternarWhatsapp(): void {
    this.whatsappActivo.update((activo) => !activo);
  }

  protected alternarEmail(): void {
    this.emailActivo.update((activo) => !activo);
  }
}
