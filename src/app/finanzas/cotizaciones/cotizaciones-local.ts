import { Injectable } from '@angular/core';
import { DatosRegistro, ErrorCrud, siguienteConsecutivo } from 'src/app/shared/crud/crud';
import { RepositorioLocal } from 'src/app/shared/crud/repositorio-local';
import { normalizar } from 'src/app/shared/formularios/formularios';
import { Cotizacion, FILTROS_COTIZACION_VACIOS, FiltrosCotizacion, calcularTotal } from './cotizacion';
import { CotizacionesRepositorio } from './cotizaciones-repositorio';

/** Almacenamiento TEMPORAL en `localStorage` mientras se construye el API. */
@Injectable()
export class CotizacionesLocal extends RepositorioLocal<Cotizacion, FiltrosCotizacion> implements CotizacionesRepositorio {
  protected readonly clave = 'rutarola.cotizaciones';
  protected readonly filtrosVacios = FILTROS_COTIZACION_VACIOS;

  protected coincide(c: Cotizacion, f: FiltrosCotizacion): boolean {
    const texto = normalizar(f.texto);
    return (
      (!texto || normalizar(`${c.numero} ${c.nombreAcudiente} ${c.estudiantes.map((e) => e.nombre).join(' ')}`).includes(texto)) &&
      (!f.estado || c.estado === f.estado) &&
      (!f.desde || c.fecha >= f.desde) &&
      (!f.hasta || c.fecha <= f.hasta)
    );
  }

  protected etiquetaOpcion(c: Cotizacion): string {
    return `${c.numero} · ${c.nombreAcudiente}`;
  }

  protected override ordenar(a: Cotizacion, b: Cotizacion): number {
    return b.numero.localeCompare(a.numero, 'es', { numeric: true });
  }

  protected override validar(datos: DatosRegistro<Cotizacion>): void {
    if (!datos.estudiantes.length) {
      throw new ErrorCrud('Agrega al menos un estudiante a la cotización.', 'VALIDACION');
    }
    if (datos.registrados && !datos.acudienteId) {
      throw new ErrorCrud('Elige el acudiente registrado.', 'VALIDACION');
    }
  }

  protected override preparar(datos: DatosRegistro<Cotizacion>, idActual: string | null, registros: Cotizacion[]): DatosRegistro<Cotizacion> {
    const valorTotal = calcularTotal(datos.valorPorEstudiante, datos.estudiantes.length);
    return idActual
      ? { ...datos, valorTotal }
      : { ...datos, valorTotal, numero: siguienteConsecutivo('COT', registros.map((r) => r.numero)) };
  }

  protected datosIniciales(): Cotizacion[] {
    const cotizacion = (
      id: string,
      numero: string,
      fecha: string,
      acudiente: { id: string | null; nombre: string; telefono: string },
      estudiantes: [string | null, string][],
      valorPorEstudiante: number,
      estado: Cotizacion['estado'],
    ): Cotizacion => ({
      id,
      numero,
      fecha,
      registrados: acudiente.id !== null,
      acudienteId: acudiente.id,
      nombreAcudiente: acudiente.nombre,
      telefonoAcudiente: acudiente.telefono,
      estudiantes: estudiantes.map(([estudianteId, nombre]) => ({ estudianteId, nombre })),
      valorPorEstudiante,
      valorTotal: calcularTotal(valorPorEstudiante, estudiantes.length),
      estado,
      observaciones: '',
      fechaCreacion: `${fecha}T09:00:00.000Z`,
      fechaActualizacion: `${fecha}T09:00:00.000Z`,
    });
    return [
      cotizacion('cot-1', 'COT-0001', '2026-01-15', { id: 'acu-1', nombre: 'María Pérez López', telefono: '3001234567' },
        [['est-1', 'Juan Sebastián Pérez López'], ['est-2', 'Valentina Pérez López']], 400000, 'APROBADA'),
      cotizacion('cot-2', 'COT-0002', '2026-09-22', { id: null, nombre: 'Camila Torres Ramírez', telefono: '3209988776' },
        [[null, 'Miguel Ángel Torres'], [null, 'Lucía Torres']], 380000, 'PENDIENTE'),
      cotizacion('cot-3', 'COT-0003', '2026-10-03', { id: 'acu-6', nombre: 'Fernando Ríos Salazar', telefono: '3118765432' },
        [['est-11', 'Antonella Ríos Salazar']], 360000, 'RECHAZADA'),
      cotizacion('cot-4', 'COT-0004', '2026-10-28', { id: null, nombre: 'Julián Peña Cabrera', telefono: '3014455667' },
        [[null, 'Sofía Peña']], 420000, 'PENDIENTE'),
    ];
  }
}
