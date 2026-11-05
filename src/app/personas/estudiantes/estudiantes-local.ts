import { Injectable } from '@angular/core';
import { DatosRegistro, ErrorCrud } from 'src/app/shared/crud/crud';
import { RepositorioLocal } from 'src/app/shared/crud/repositorio-local';
import { normalizar } from 'src/app/shared/formularios/formularios';
import { Estudiante, FiltrosEstudiante, nombreCompleto } from './estudiante';
import { EstudiantesRepositorio } from './estudiantes-repositorio';

/** Almacenamiento TEMPORAL en `localStorage` mientras se construye el API. */
@Injectable()
export class EstudiantesLocal
  extends RepositorioLocal<Estudiante, FiltrosEstudiante>
  implements EstudiantesRepositorio
{
  protected readonly clave = 'rutarola.estudiantes';

  protected coincide(e: Estudiante, f: FiltrosEstudiante): boolean {
    const texto = normalizar(f.texto);
    return (
      (!texto || normalizar(`${nombreCompleto(e)} ${e.numeroDocumento}`).includes(texto)) &&
      (!f.colegioId || e.colegioId === f.colegioId) &&
      (!f.grado || e.grado === f.grado) &&
      (!f.estado || e.estado === f.estado)
    );
  }

  protected override ordenar(a: Estudiante, b: Estudiante): number {
    return `${a.primerApellido} ${a.primerNombre}`.localeCompare(`${b.primerApellido} ${b.primerNombre}`, 'es');
  }

  protected override validar(datos: DatosRegistro<Estudiante>, idActual: string | null, registros: Estudiante[]): void {
    const duplicado = registros.some(
      (e) =>
        e.id !== idActual &&
        e.tipoDocumento === datos.tipoDocumento &&
        e.numeroDocumento === datos.numeroDocumento,
    );
    if (duplicado) {
      throw new ErrorCrud(
        `Ya existe un estudiante con el documento ${datos.tipoDocumento} ${datos.numeroDocumento}.`,
        'DUPLICADO',
      );
    }
  }

  protected datosIniciales(): Estudiante[] {
    const base = (
      id: string,
      tipoDocumento: string,
      numeroDocumento: string,
      [primerNombre, segundoNombre, primerApellido, segundoApellido]: [string, string, string, string],
      fechaNacimiento: string,
      acudienteId: string,
      colegioId: string,
      grado: string,
      jornada: string,
      estado: Estudiante['estado'] = 'ACTIVO',
    ): Estudiante => ({
      id,
      tipoDocumento,
      numeroDocumento,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      fechaNacimiento,
      direccion: 'Calle 10 # 5-23, Neiva',
      acudienteId,
      colegioId,
      grado,
      jornada,
      estado,
      observaciones: '',
      fechaCreacion: '2026-01-15T08:00:00.000Z',
      fechaActualizacion: '2026-01-15T08:00:00.000Z',
    });

    return [
      base('est-1', 'TI', '1020304050', ['Juan', 'Sebastián', 'Pérez', 'López'], '2013-04-12', 'acu-1', 'col-5', '7°', 'Mañana'),
      base('est-2', 'TI', '1020304051', ['Valentina', '', 'Pérez', 'López'], '2015-09-03', 'acu-1', 'col-5', '5°', 'Mañana'),
      base('est-3', 'RC', '1122334455', ['Samuel', 'David', 'Rodríguez', 'Mejía'], '2019-02-21', 'acu-2', 'col-1', 'Transición', 'Mañana'),
      base('est-4', 'TI', '1098765432', ['Isabella', '', 'Gómez', 'Vargas'], '2012-11-30', 'acu-3', 'col-2', '8°', 'Tarde'),
      base('est-5', 'TI', '1098765433', ['Mateo', 'Andrés', 'Gómez', 'Vargas'], '2014-06-18', 'acu-3', 'col-2', '6°', 'Tarde'),
      base('est-6', 'CC', '1075123456', ['Daniela', '', 'Martínez', 'Ruiz'], '2008-01-09', 'acu-4', 'col-3', '11°', 'Única'),
      base('est-7', 'TI', '1075987654', ['Tomás', '', 'Martínez', 'Ruiz'], '2011-07-25', 'acu-4', 'col-3', '9°', 'Única'),
      base('est-8', 'RC', '1133557799', ['Emiliano', '', 'Castillo', 'Ortiz'], '2020-03-14', 'acu-5', 'col-4', 'Jardín', 'Mañana'),
      base('est-9', 'TI', '1144668800', ['Sara', 'Lucía', 'Castillo', 'Ortiz'], '2016-12-01', 'acu-5', 'col-4', '4°', 'Mañana'),
      base('est-10', 'TI', '1066778899', ['Martín', '', 'Ríos', 'Salazar'], '2013-10-10', 'acu-6', 'col-1', '7°', 'Tarde', 'INACTIVO'),
      base('est-11', 'RC', '1155443322', ['Antonella', '', 'Ríos', 'Salazar'], '2018-08-08', 'acu-6', 'col-1', '1°', 'Tarde'),
      base('est-12', 'TI', '1088990011', ['Jerónimo', '', 'Rodríguez', 'Mejía'], '2015-05-05', 'acu-2', 'col-1', '5°', 'Mañana'),
    ];
  }
}
