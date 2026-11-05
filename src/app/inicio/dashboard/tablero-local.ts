import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { FILTROS_COTIZACION_VACIOS } from 'src/app/finanzas/cotizaciones/cotizacion';
import { CotizacionesRepositorio } from 'src/app/finanzas/cotizaciones/cotizaciones-repositorio';
import { FILTROS_FACTURA_VACIOS } from 'src/app/finanzas/facturas/factura';
import { FacturasRepositorio } from 'src/app/finanzas/facturas/facturas-repositorio';
import { FILTROS_PROGRAMACION_VACIOS } from 'src/app/finanzas/programacion/programacion';
import { ProgramacionesRepositorio } from 'src/app/finanzas/programacion/programaciones-repositorio';
import { FILTROS_RECIBO_VACIOS } from 'src/app/finanzas/recibos/recibo';
import { RecibosRepositorio } from 'src/app/finanzas/recibos/recibos-repositorio';
import { ReportesRepositorio } from 'src/app/finanzas/reportes/reportes-repositorio';
import { FILTROS_ASIGNACION_VACIOS } from 'src/app/operacion/asignaciones/asignacion';
import { AsignacionesRepositorio } from 'src/app/operacion/asignaciones/asignaciones-repositorio';
import { FILTROS_COLEGIO_VACIOS } from 'src/app/operacion/colegios/colegio';
import { ColegiosRepositorio } from 'src/app/operacion/colegios/colegios-repositorio';
import { FILTROS_RUTA_VACIOS } from 'src/app/operacion/rutas/ruta';
import { RutasRepositorio } from 'src/app/operacion/rutas/rutas-repositorio';
import { FILTROS_VEHICULO_VACIOS } from 'src/app/operacion/vehiculos/vehiculo';
import { VehiculosRepositorio } from 'src/app/operacion/vehiculos/vehiculos-repositorio';
import { FILTROS_EMPLEADO_VACIOS } from 'src/app/personas/empleados/empleado';
import { EmpleadosRepositorio } from 'src/app/personas/empleados/empleados-repositorio';
import { FILTROS_ESTUDIANTE_VACIOS } from 'src/app/personas/estudiantes/estudiante';
import { EstudiantesRepositorio } from 'src/app/personas/estudiantes/estudiantes-repositorio';
import { FuenteLocal, SIN_PAGINAR } from 'src/app/shared/crud/repositorio-local';
import { calcularTablero } from './calcular-tablero';
import { Tablero } from './tablero';
import { TableroRepositorio } from './tablero-repositorio';

/** Calcula el tablero con los datos locales de todos los módulos (lo que haría `GET /tablero`). */
@Injectable()
export class TableroLocal extends TableroRepositorio implements FuenteLocal {
  readonly modoLocal = true as const;
  private readonly facturas = inject(FacturasRepositorio);
  private readonly recibos = inject(RecibosRepositorio);
  private readonly reportes = inject(ReportesRepositorio);
  private readonly estudiantes = inject(EstudiantesRepositorio);
  private readonly colegios = inject(ColegiosRepositorio);
  private readonly rutas = inject(RutasRepositorio);
  private readonly asignaciones = inject(AsignacionesRepositorio);
  private readonly vehiculos = inject(VehiculosRepositorio);
  private readonly empleados = inject(EmpleadosRepositorio);
  private readonly cotizaciones = inject(CotizacionesRepositorio);
  private readonly programaciones = inject(ProgramacionesRepositorio);

  obtener(): Observable<Tablero> {
    const items = <T>(o: Observable<{ items: T[] }>) => o.pipe(map((p) => p.items));
    const programaciones = items(this.programaciones.listar(FILTROS_PROGRAMACION_VACIOS, SIN_PAGINAR));
    return forkJoin({
      facturas: items(this.facturas.listar(FILTROS_FACTURA_VACIOS, SIN_PAGINAR)),
      recibos: items(this.recibos.listar(FILTROS_RECIBO_VACIOS, SIN_PAGINAR)),
      cuotas: this.reportes.pendientes({ texto: '', acudienteId: '', situacion: '' }),
      estudiantes: items(this.estudiantes.listar(FILTROS_ESTUDIANTE_VACIOS, SIN_PAGINAR)),
      colegios: items(this.colegios.listar(FILTROS_COLEGIO_VACIOS, SIN_PAGINAR)),
      rutas: items(this.rutas.listar(FILTROS_RUTA_VACIOS, SIN_PAGINAR)),
      asignaciones: items(this.asignaciones.listar(FILTROS_ASIGNACION_VACIOS, SIN_PAGINAR)),
      vehiculos: items(this.vehiculos.listar(FILTROS_VEHICULO_VACIOS, SIN_PAGINAR)),
      empleados: items(this.empleados.listar(FILTROS_EMPLEADO_VACIOS, SIN_PAGINAR)),
      cotizaciones: items(this.cotizaciones.listar(FILTROS_COTIZACION_VACIOS, SIN_PAGINAR)),
      programaciones,
      envios: programaciones.pipe(
        switchMap((lista) =>
          lista.length ? forkJoin(lista.map((p) => this.programaciones.historial(p.id))).pipe(map((h) => h.flat())) : of([]),
        ),
      ),
    }).pipe(map((datos) => calcularTablero(datos)));
  }
}
