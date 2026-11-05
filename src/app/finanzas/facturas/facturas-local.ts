import { Injectable, Injector, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { EstudiantesRepositorio } from 'src/app/personas/estudiantes/estudiantes-repositorio';
import { DatosRegistro, ErrorCrud, siguienteConsecutivo } from 'src/app/shared/crud/crud';
import { RepositorioLocal } from 'src/app/shared/crud/repositorio-local';
import { normalizar } from 'src/app/shared/formularios/formularios';
import { FILTROS_PROGRAMACION_VACIOS } from '../programacion/programacion';
import { ProgramacionesRepositorio } from '../programacion/programaciones-repositorio';
import { FILTROS_RECIBO_VACIOS } from '../recibos/recibo';
import { RecibosRepositorio } from '../recibos/recibos-repositorio';
import { FILTROS_FACTURA_VACIOS, Factura, FiltrosFactura, etiquetaFactura } from './factura';
import { FacturasRepositorio } from './facturas-repositorio';

/** Almacenamiento TEMPORAL en `localStorage` mientras se construye el API. */
@Injectable()
export class FacturasLocal extends RepositorioLocal<Factura, FiltrosFactura> implements FacturasRepositorio {
  protected readonly clave = 'rutarola.facturas';
  protected readonly filtrosVacios = FILTROS_FACTURA_VACIOS;
  private readonly injector = inject(Injector);

  protected coincide(f: Factura, filtros: FiltrosFactura): boolean {
    const texto = normalizar(filtros.texto);
    return (
      (!texto || normalizar(`${f.numero} ${f.nombreAcudiente} ${f.nombreEstudiante}`).includes(texto)) &&
      (!filtros.acudienteId || f.acudienteId === filtros.acudienteId) &&
      (!filtros.estudianteId || f.estudianteId === filtros.estudianteId) &&
      (!filtros.estado || f.estado === filtros.estado)
    );
  }

  protected etiquetaOpcion(f: Factura): string {
    return etiquetaFactura(f);
  }

  protected override ordenar(a: Factura, b: Factura): number {
    return b.numero.localeCompare(a.numero, 'es', { numeric: true });
  }

  protected override validar(datos: DatosRegistro<Factura>, idActual: string | null, registros: Factura[]): void {
    if (datos.periodoFin < datos.periodoInicio) {
      throw new ErrorCrud('El mes final no puede ser anterior al mes inicial.', 'VALIDACION');
    }
    if (datos.estado === 'ACTIVO') {
      const cruce = registros.find(
        (r) =>
          r.id !== idActual &&
          r.estado === 'ACTIVO' &&
          r.estudianteId === datos.estudianteId &&
          r.periodoInicio <= datos.periodoFin &&
          datos.periodoInicio <= r.periodoFin,
      );
      if (cruce) {
        throw new ErrorCrud(
          `${datos.nombreEstudiante} ya tiene la factura vigente ${cruce.numero} en ese periodo. Anúlala o ajusta los meses.`,
          'DUPLICADO',
        );
      }
    }
  }

  /** El estudiante debe pertenecer al acudiente de la factura. */
  protected override validarRelaciones(datos: DatosRegistro<Factura>): Observable<unknown> {
    return this.injector
      .get(EstudiantesRepositorio)
      .obtener(datos.estudianteId)
      .pipe(
        map((estudiante) => {
          if (estudiante.acudienteId !== datos.acudienteId) {
            throw new ErrorCrud('El estudiante no está a cargo del acudiente elegido.', 'VALIDACION');
          }
        }),
      );
  }

  protected override preparar(datos: DatosRegistro<Factura>, idActual: string | null, registros: Factura[]): DatosRegistro<Factura> {
    return idActual ? datos : { ...datos, numero: siguienteConsecutivo('FAC', registros.map((r) => r.numero)) };
  }

  override motivoNoEliminar(id: string): Observable<string | null> {
    return forkJoin([
      this.injector.get(RecibosRepositorio).listar({ ...FILTROS_RECIBO_VACIOS, facturaId: id }, { pagina: 1, tamano: 1 }),
      this.injector.get(ProgramacionesRepositorio).listar({ ...FILTROS_PROGRAMACION_VACIOS, facturaId: id }, { pagina: 1, tamano: 1 }),
    ]).pipe(
      map(([recibos, programaciones]) => {
        if (recibos.total) return `No se puede eliminar: tiene ${recibos.total} recibo(s) de pago. Anúlala para conservar el historial.`;
        if (programaciones.total) return 'No se puede eliminar: tiene una programación de facturación. Elimina primero la programación o anula la factura.';
        return null;
      }),
    );
  }

  protected datosIniciales(): Factura[] {
    const factura = (
      id: string,
      numero: string,
      [acudienteId, nombreAcudiente]: [string, string],
      [estudianteId, nombreEstudiante]: [string, string],
      valorContratacion: number,
    ): Factura => ({
      id,
      numero,
      fechaEmision: '2026-01-25',
      acudienteId,
      estudianteId,
      nombreAcudiente,
      nombreEstudiante,
      valorContratacion,
      periodoInicio: '2026-02',
      periodoFin: '2026-11',
      concepto: 'Transporte escolar 2026',
      estado: 'ACTIVO',
      observaciones: '',
      fechaCreacion: '2026-01-25T08:00:00.000Z',
      fechaActualizacion: '2026-01-25T08:00:00.000Z',
    });
    // Ids coherentes con acudientes y estudiantes de ejemplo.
    return [
      factura('fac-1', 'FAC-0001', ['acu-1', 'María Pérez López'], ['est-1', 'Juan Sebastián Pérez López'], 420000),
      factura('fac-2', 'FAC-0002', ['acu-1', 'María Pérez López'], ['est-2', 'Valentina Pérez López'], 380000),
      factura('fac-3', 'FAC-0003', ['acu-2', 'Carlos Andrés Rodríguez Mejía'], ['est-3', 'Samuel David Rodríguez Mejía'], 350000),
      factura('fac-4', 'FAC-0004', ['acu-3', 'Luz Marina Gómez Vargas'], ['est-4', 'Isabella Gómez Vargas'], 450000),
      factura('fac-5', 'FAC-0005', ['acu-4', 'Jorge Martínez Ruiz'], ['est-6', 'Daniela Martínez Ruiz'], 400000),
      factura('fac-6', 'FAC-0006', ['acu-5', 'Andrea Castillo Ortiz'], ['est-9', 'Sara Lucía Castillo Ortiz'], 390000),
    ];
  }
}
