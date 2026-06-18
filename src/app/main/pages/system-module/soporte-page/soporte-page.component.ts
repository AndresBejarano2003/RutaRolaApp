import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-soporte-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './soporte-page.component.html'
})
export default class SoportePageComponent {

  tipoSolicitud = '';
  asunto = '';
  descripcion = '';

  ticketsAbiertos = signal(3);
  ticketsResueltos = signal(21);
  tiempoRespuesta = signal('2h');
  videoUrl = signal<SafeResourceUrl | null>(null);
  youtubeLink = signal('');

  private sanitizer = inject(DomSanitizer);

  enviarTicket() {

    console.log({
      tipo: this.tipoSolicitud,
      asunto: this.asunto,
      descripcion: this.descripcion
    });

    alert('Solicitud enviada correctamente');

    this.tipoSolicitud = '';
    this.asunto = '';
    this.descripcion = '';

  }

  abrirWhatsApp(): void {

    const numero = '573202871272';

    const mensaje = encodeURIComponent(`
      Hola equipo RutaRola.

      Necesito ayuda con el sistema.

      Módulo:
      Descripción:
    `);

    window.open(
      `https://wa.me/${numero}?text=${mensaje}`,
      '_blank'
    );

  }

  abrirTutorial(videoId: string) {

    this.youtubeLink.set(
      `https://www.youtube.com/watch?v=${videoId}`
    );

    this.videoUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}`
      )
    );

    (
      document.getElementById(
        'modalTutorial'
      ) as HTMLDialogElement
    ).showModal();

  }

  cerrarTutorial() {

    this.videoUrl.set(null);
    this.youtubeLink.set('');

    (
      document.getElementById(
        'modalTutorial'
      ) as HTMLDialogElement
    ).close();

  }

  pdfUrl = signal<SafeResourceUrl | null>(null);

  pdfDownloadUrl = signal('');

  manualSeleccionado = signal('');

  manuales = [
    {
      nombre: 'Manual General RutaRola',
      icono: 'fa-solid fa-book',
      archivo: 'documentacion/manual-general.pdf'
    },
    {
      nombre: 'Gestión de Estudiantes',
      icono: 'fa-solid fa-user-graduate',
      archivo: 'documentacion/estudiantes.pdf'
    },
    {
      nombre: 'Gestión de Acudientes',
      icono: 'fa-solid fa-people-roof',
      archivo: 'documentacion/acudientes.pdf'
    },
    {
      nombre: 'Finanzas y Contrataciones',
      icono: 'fa-solid fa-file-invoice-dollar',
      archivo: 'documentacion/finanzas.pdf'
    },
    {
      nombre: 'Rutas y Operación',
      icono: 'fa-solid fa-route',
      archivo: 'documentacion/rutas.pdf'
    },
    {
      nombre: 'Programación de Facturación',
      icono: 'fa-solid fa-calendar-days',
      archivo: 'documentacion/facturacion.pdf'
    }
  ];

  abrirManual(manual: any): void {

    this.manualSeleccionado.set(manual.nombre);

    this.pdfDownloadUrl.set(
      manual.archivo
    );

    this.pdfUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        manual.archivo
      )
    );

    (
      document.getElementById(
        'modalDocumentacion'
      ) as HTMLDialogElement
    ).showModal();

  }

  cerrarManual(): void {

    this.pdfUrl.set(null);

    (
      document.getElementById(
        'modalDocumentacion'
      ) as HTMLDialogElement
    ).close();

  }
}