import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/auth';
import { mensajeDeError } from 'src/app/shared/crud/crud';
import { NotificacionesService } from 'src/app/shared/notificaciones/notificaciones';
import {
  ESTADOS_PARADA,
  EstadoParada,
  Parada,
  Recorrido,
  TRAYECTOS,
  avance,
  contarParadas,
  enlaceMapa,
  enlaceWhatsapp,
  siguientePaso,
} from '../recorrido';
import { RecorridosRepositorio } from '../recorridos-repositorio';

/** Estado al que vuelve cada uno con "Deshacer". */
const DESHACER: Partial<Record<EstadoParada, EstadoParada>> = { A_BORDO: 'PENDIENTE', ENTREGADO: 'A_BORDO', AUSENTE: 'PENDIENTE' };

/**
 * Recorrido en curso: muestra SIEMPRE el siguiente paso (a quién recoger o entregar),
 * con acceso a la dirección y al acudiente, y la lista completa para marcar fuera de orden o deshacer.
 */
@Component({
  selector: 'app-recorrido-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, NgTemplateOutlet],
  templateUrl: './recorrido-page.html',
})
export default class RecorridoPage implements OnInit {
  private readonly repositorio = inject(RecorridosRepositorio);
  private readonly avisos = inject(NotificacionesService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly sesion = inject(AuthService).sesion;

  protected readonly estados = ESTADOS_PARADA;
  protected readonly enlaceMapa = enlaceMapa;

  protected readonly recorrido = signal<Recorrido | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly procesando = signal(false);
  protected observaciones = '';

  protected readonly trayecto = computed(() => TRAYECTOS.find((t) => t.id === this.recorrido()?.trayecto) ?? TRAYECTOS[0]);
  protected readonly conteo = computed(() => contarParadas(this.recorrido()?.paradas ?? []));
  protected readonly avance = computed(() => avance(this.conteo()));
  protected readonly paso = computed(() => {
    const r = this.recorrido();
    return r && r.estado === 'EN_CURSO' ? siguientePaso(r) : null;
  });
  protected readonly enCurso = computed(() => this.recorrido()?.estado === 'EN_CURSO');
  protected readonly esRecogida = computed(() => this.recorrido()?.trayecto === 'RECOGIDA');

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      this.recorrido.set(await firstValueFrom(this.repositorio.obtener(this.id)));
      this.error.set(null);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  /** Sin toast: el cambio se ve en el siguiente paso y en la lista (solo se avisan errores y el cierre). */
  protected marcar(estudianteIds: string[], estado: EstadoParada): Promise<void> {
    return this.ejecutar(this.repositorio.marcar(this.id, estudianteIds, estado));
  }

  protected deshacer(p: Parada): Promise<void> {
    const anterior = DESHACER[p.estado];
    return anterior ? this.marcar([p.estudianteId], anterior) : Promise.resolve();
  }

  protected puedeDeshacer(p: Parada): boolean {
    return p.estado !== 'PENDIENTE';
  }

  protected idsCon(estado: EstadoParada): string[] {
    return (this.recorrido()?.paradas ?? []).filter((p) => p.estado === estado).map((p) => p.estudianteId);
  }

  protected finalizar(): Promise<void> {
    return this.ejecutar(this.repositorio.finalizar(this.id, this.observaciones), 'Recorrido finalizado. ¡Buen trabajo!');
  }

  private async ejecutar(operacion: Observable<Recorrido>, mensaje?: string): Promise<void> {
    this.procesando.set(true);
    try {
      this.recorrido.set(await firstValueFrom(operacion));
      if (mensaje) this.avisos.exito(mensaje);
    } catch (error) {
      this.avisos.error(mensajeDeError(error));
    } finally {
      this.procesando.set(false);
    }
  }

  protected hora(iso: string | null): string {
    return iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '';
  }

  protected telefono(numero: string): string {
    return `tel:${numero.replace(/\D/g, '')}`;
  }

  /** Mensaje de WhatsApp al acudiente según el momento del recorrido. */
  protected whatsapp(p: Parada): string {
    const r = this.recorrido();
    const quien = `${this.sesion()?.nombre ?? ''}, de la ruta ${r?.ruta ?? ''} de RutaRola`;
    const texto =
      r?.trayecto === 'RECOGIDA'
        ? `Hola, ${p.acudiente}. Soy ${quien}. Vamos en camino a recoger a ${p.estudiante}.`
        : `Hola, ${p.acudiente}. Soy ${quien}. Vamos en camino a entregar a ${p.estudiante}.`;
    return enlaceWhatsapp(p.telefonoAcudiente, texto);
  }

  protected momento(p: Parada): string {
    if (p.estado === 'ENTREGADO') return `Entregado ${this.hora(p.horaEntrega)}`;
    if (p.estado === 'A_BORDO') return `A bordo desde ${this.hora(p.horaAbordo)}`;
    return this.estados[p.estado].nombre;
  }
}
