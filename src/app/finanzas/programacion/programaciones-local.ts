import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatosRegistro, ErrorCrud } from 'src/app/shared/crud/crud';
import { RepositorioLocal } from 'src/app/shared/crud/repositorio-local';
import { periodosEntre } from 'src/app/shared/fechas/fechas';
import { normalizar } from 'src/app/shared/formularios/formularios';
import {
  EnvioProgramado,
  FILTROS_PROGRAMACION_VACIOS,
  FiltrosProgramacion,
  PlantillaMensaje,
  Programacion,
} from './programacion';
import { ProgramacionesRepositorio } from './programaciones-repositorio';

const CLAVE_ENVIOS = 'rutarola.envios';

/** Almacenamiento TEMPORAL en `localStorage` mientras se construye el API. */
@Injectable()
export class ProgramacionesLocal
  extends RepositorioLocal<Programacion, FiltrosProgramacion>
  implements ProgramacionesRepositorio
{
  protected readonly clave = 'rutarola.programaciones';
  protected readonly filtrosVacios = FILTROS_PROGRAMACION_VACIOS;

  protected coincide(p: Programacion, f: FiltrosProgramacion): boolean {
    const texto = normalizar(f.texto);
    return (
      (!texto || normalizar(`${p.nombre} ${p.numeroFactura}`).includes(texto)) &&
      (!f.facturaId || p.facturaId === f.facturaId) &&
      (!f.estado || p.estado === f.estado)
    );
  }

  protected etiquetaOpcion(p: Programacion): string {
    return p.nombre;
  }

  protected override ordenar(a: Programacion, b: Programacion): number {
    return a.nombre.localeCompare(b.nombre, 'es');
  }

  protected override validar(datos: DatosRegistro<Programacion>, idActual: string | null, registros: Programacion[]): void {
    const otra = registros.find((r) => r.id !== idActual && r.facturaId === datos.facturaId);
    if (otra) {
      throw new ErrorCrud(`La factura ${datos.numeroFactura} ya tiene la programación "${otra.nombre}".`, 'DUPLICADO');
    }
    const enUso = (plantillas: PlantillaMensaje[]) => plantillas.filter((p) => p.estado === 'EN_USO').length;
    if (datos.whatsapp && enUso(datos.mensajesWhatsapp) !== 1) {
      throw new ErrorCrud('Marca exactamente un mensaje de WhatsApp "En uso".', 'VALIDACION');
    }
    if (datos.email && enUso(datos.correos) !== 1) {
      throw new ErrorCrud('Marca exactamente un correo "En uso".', 'VALIDACION');
    }
    if (!datos.whatsapp && !datos.email && datos.estado === 'ACTIVO') {
      throw new ErrorCrud('Una programación activa debe enviar por WhatsApp, correo o ambos.', 'VALIDACION');
    }
  }

  historial(programacionId: string): Observable<EnvioProgramado[]> {
    return this.responder(() =>
      this.leerEnvios()
        .filter((e) => e.programacionId === programacionId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    );
  }

  conteoEnvios(ids: string[]): Observable<Record<string, number>> {
    return this.responder(() => {
      const envios = this.leerEnvios();
      return Object.fromEntries(ids.map((id) => [id, envios.filter((e) => e.programacionId === id).length]));
    });
  }

  /** Historial de ejemplo (en producción lo escribe el proceso de envío del servidor). */
  private leerEnvios(): EnvioProgramado[] {
    try {
      const guardado = localStorage.getItem(CLAVE_ENVIOS);
      if (guardado) return JSON.parse(guardado) as EnvioProgramado[];
    } catch {
      // Sin almacenamiento: se usan los de ejemplo.
    }
    const envios = enviosDeEjemplo();
    try {
      localStorage.setItem(CLAVE_ENVIOS, JSON.stringify(envios));
    } catch {
      // Solo en memoria.
    }
    return envios;
  }

  protected datosIniciales(): Programacion[] {
    const whatsapp = (cuerpo: string, estado: PlantillaMensaje['estado'], id: string): PlantillaMensaje => ({
      id,
      asunto: '',
      cuerpo,
      adjuntos: [],
      estado,
    });
    const correo = (asunto: string, cuerpo: string, estado: PlantillaMensaje['estado'], id: string): PlantillaMensaje => ({
      id,
      asunto,
      cuerpo,
      adjuntos: [],
      estado,
    });
    const mensajeBase =
      'Hola {acudiente}, te recordamos que la mensualidad de transporte de {estudiante} de {mes} por {valor} vence el {fecha_limite}. Factura {factura}. ¡Gracias!';
    const programacion = (
      id: string,
      nombre: string,
      [facturaId, numeroFactura]: [string, string],
      diaLimitePago: number,
      diasPrevios: number,
      email: boolean,
    ): Programacion => ({
      id,
      nombre,
      facturaId,
      numeroFactura,
      diaLimitePago,
      diasPrevios,
      whatsapp: true,
      mensajesWhatsapp: [
        whatsapp(mensajeBase, 'EN_USO', `${id}-w1`),
        whatsapp('Hola {acudiente}, {estudiante} tiene pendiente {mes}: {valor}. Puedes pagar por Nequi o transferencia.', 'ACTIVO', `${id}-w2`),
      ],
      email,
      correos: email
        ? [correo('Recordatorio de pago {mes} - {factura}', `${mensajeBase}\n\nCordialmente,\nRutaRola Transporte Escolar`, 'EN_USO', `${id}-c1`)]
        : [],
      estado: 'ACTIVO',
      fechaCreacion: '2026-01-26T08:00:00.000Z',
      fechaActualizacion: '2026-01-26T08:00:00.000Z',
    });
    return [
      programacion('prg-1', 'Mensualidad Juan Sebastián', ['fac-1', 'FAC-0001'], 5, 3, true),
      programacion('prg-2', 'Mensualidad Valentina', ['fac-2', 'FAC-0002'], 5, 3, true),
      programacion('prg-3', 'Mensualidad Isabella', ['fac-4', 'FAC-0004'], 10, 5, false),
    ];
  }
}

function enviosDeEjemplo(): EnvioProgramado[] {
  const envios: EnvioProgramado[] = [];
  const destinos: Record<string, [string, string, number, boolean]> = {
    'prg-1': ['3001234567', 'maria.perez@correo.com', 5 - 3, true],
    'prg-2': ['3001234567', 'maria.perez@correo.com', 5 - 3, true],
    'prg-3': ['3157654321', '', 10 - 5, false],
  };
  for (const [programacionId, [telefono, correo, dia, conCorreo]] of Object.entries(destinos)) {
    for (const periodo of periodosEntre('2026-08', '2026-11')) {
      const fecha = `${periodo}-${String(dia).padStart(2, '0')}T08:00:00.000Z`;
      const fallido = programacionId === 'prg-3' && periodo === '2026-09';
      envios.push({
        id: `${programacionId}-${periodo}-w`,
        programacionId,
        fecha,
        canal: 'WHATSAPP',
        destinatario: telefono,
        periodo,
        estado: fallido ? 'FALLIDO' : 'ENVIADO',
        detalle: fallido ? 'El número no tiene WhatsApp activo.' : 'Entregado',
      });
      if (conCorreo) {
        envios.push({
          id: `${programacionId}-${periodo}-c`,
          programacionId,
          fecha,
          canal: 'EMAIL',
          destinatario: correo,
          periodo,
          estado: 'ENVIADO',
          detalle: 'Entregado',
        });
      }
    }
  }
  return envios;
}
