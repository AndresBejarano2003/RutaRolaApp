import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Manual {
  nombre: string;
  icono: string;
  /** Ruta relativa a `public/`. */
  archivo: string;
}

const WHATSAPP_SOPORTE = '573202871272';

const MENSAJE_WHATSAPP = `
      Hola equipo RutaRola.

      Necesito ayuda con el sistema.

      Módulo:
      Descripción:
    `;

const MANUALES: Manual[] = [
  { nombre: 'Manual General RutaRola', icono: 'fa-solid fa-book', archivo: 'documentacion/manual-general.pdf' },
  { nombre: 'Gestión de Estudiantes', icono: 'fa-solid fa-user-graduate', archivo: 'documentacion/estudiantes.pdf' },
  { nombre: 'Gestión de Acudientes', icono: 'fa-solid fa-people-roof', archivo: 'documentacion/acudientes.pdf' },
  { nombre: 'Finanzas y Contrataciones', icono: 'fa-solid fa-file-invoice-dollar', archivo: 'documentacion/finanzas.pdf' },
  { nombre: 'Rutas y Operación', icono: 'fa-solid fa-route', archivo: 'documentacion/rutas.pdf' },
  { nombre: 'Programación de Facturación', icono: 'fa-solid fa-calendar-days', archivo: 'documentacion/facturacion.pdf' },
];

@Component({
  selector: 'app-soporte-page',
  imports: [FormsModule],
  templateUrl: './soporte-page.html',
})
export default class SoportePage {
  private readonly sanitizer = inject(DomSanitizer);

  private readonly modalTutorial = viewChild.required<ElementRef<HTMLDialogElement>>('modalTutorial');
  private readonly modalDocumentacion = viewChild.required<ElementRef<HTMLDialogElement>>('modalDocumentacion');

  // Formulario de ticket
  protected tipoSolicitud = '';
  protected asunto = '';
  protected descripcion = '';

  // Indicadores (datos de ejemplo)
  protected readonly ticketsAbiertos = signal(3);
  protected readonly ticketsResueltos = signal(21);
  protected readonly tiempoRespuesta = signal('2h');

  // Tutoriales
  protected readonly videoUrl = signal<SafeResourceUrl | null>(null);
  protected readonly youtubeLink = signal('');

  // Manuales
  protected readonly manuales = MANUALES;
  protected readonly manualSeleccionado = signal('');
  protected readonly pdfUrl = signal<SafeResourceUrl | null>(null);
  protected readonly pdfDownloadUrl = signal('');

  protected enviarTicket(): void {
    // TODO: enviar al backend.
    console.log({ tipo: this.tipoSolicitud, asunto: this.asunto, descripcion: this.descripcion });
    alert('Solicitud enviada correctamente');

    this.tipoSolicitud = '';
    this.asunto = '';
    this.descripcion = '';
  }

  protected abrirWhatsApp(): void {
    const mensaje = encodeURIComponent(MENSAJE_WHATSAPP);
    window.open(`https://wa.me/${WHATSAPP_SOPORTE}?text=${mensaje}`, '_blank');
  }

  protected abrirTutorial(videoId: string): void {
    this.youtubeLink.set(`https://www.youtube.com/watch?v=${videoId}`);
    // videoId viene de constantes del template, no de entrada del usuario.
    this.videoUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`),
    );
    this.modalTutorial().nativeElement.showModal();
  }

  protected cerrarTutorial(): void {
    this.videoUrl.set(null);
    this.youtubeLink.set('');
    this.modalTutorial().nativeElement.close();
  }

  protected abrirManual(manual: Manual): void {
    this.manualSeleccionado.set(manual.nombre);
    this.pdfDownloadUrl.set(manual.archivo);
    this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(manual.archivo));
    this.modalDocumentacion().nativeElement.showModal();
  }

  protected cerrarManual(): void {
    this.pdfUrl.set(null);
    this.modalDocumentacion().nativeElement.close();
  }
}
