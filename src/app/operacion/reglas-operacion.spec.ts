import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DatosRegistro } from 'src/app/shared/crud/crud';
import { repositoriosDePrueba } from 'src/app/shared/pruebas/pruebas';
import { Asignacion } from './asignaciones/asignacion';
import { AsignacionesRepositorio } from './asignaciones/asignaciones-repositorio';
import { generarCursos } from './colegios/colegio';
import { ColegiosRepositorio } from './colegios/colegios-repositorio';
import { FILTROS_CONDUCTOR_VACIOS } from './conductores/conductor';
import { ConductoresRepositorio } from './conductores/conductores-repositorio';
import { Ruta } from './rutas/ruta';
import { RutasRepositorio } from './rutas/rutas-repositorio';

const TODOS = { pagina: 1, tamano: 100 };

describe('Reglas de negocio de Operación', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: repositoriosDePrueba() });
  });

  it('"Agregar cursos" llena desde Jardín hasta el curso elegido con el horario indicado', () => {
    const cursos = generarCursos([], '3°', '06:30', '12:00');
    expect(cursos.map((c) => c.grado)).toEqual(['Jardín', 'Transición', '1°', '2°', '3°']);
    expect(cursos.every((c) => c.horaEntrada === '06:30' && c.horaSalida === '12:00' && c.estado === 'ACTIVO')).toBe(true);

    // Volver a generar hasta un curso mayor actualiza el horario y agrega los faltantes.
    const ampliados = generarCursos(cursos, '5°', '07:00', '13:00');
    expect(ampliados.length).toBe(7);
    expect(ampliados.every((c) => c.horaEntrada === '07:00')).toBe(true);
  });

  it('no permite eliminar un colegio con estudiantes', async () => {
    const colegios = TestBed.inject(ColegiosRepositorio);
    expect(await firstValueFrom(colegios.motivoNoEliminar('col-1'))).toContain('estudiante');
    await expect(firstValueFrom(colegios.eliminar('col-1'))).rejects.toMatchObject({ codigo: 'EN_USO' });
  });

  it('no permite que un estudiante esté en dos rutas activas de la misma jornada', async () => {
    const rutas = TestBed.inject(RutasRepositorio);
    const nueva: DatosRegistro<Ruta> = {
      codigo: 'R-99',
      nombre: 'Prueba',
      colegioId: 'col-5',
      jornada: 'Mañana',
      sector: 'Centro',
      estudianteIds: ['est-1'],
      estado: 'ACTIVO',
      observaciones: '',
    };
    await expect(firstValueFrom(rutas.crear(nueva))).rejects.toMatchObject({ codigo: 'VALIDACION' });
    await expect(firstValueFrom(rutas.crear({ ...nueva, codigo: 'R-01', estudianteIds: [] }))).rejects.toMatchObject({ codigo: 'DUPLICADO' });
  });

  it('no permite una segunda asignación activa para la misma ruta ni usar un vehículo con documentos vencidos', async () => {
    const asignaciones = TestBed.inject(AsignacionesRepositorio);
    const base: DatosRegistro<Asignacion> = {
      rutaId: 'rut-1',
      vehiculoId: 'veh-1',
      conductorId: 'emp-1',
      monitoraId: 'emp-6',
      fechaInicio: '2026-01-15',
      fechaFin: '',
      estado: 'ACTIVO',
      observaciones: '',
    };
    await expect(firstValueFrom(asignaciones.crear(base))).rejects.toThrow(/ya tiene una asignación activa/);
    // veh-4 tiene el SOAT vencido.
    await expect(firstValueFrom(asignaciones.crear({ ...base, rutaId: 'rut-4', vehiculoId: 'veh-4' }))).rejects.toMatchObject({
      codigo: 'VALIDACION',
    });
    // Una monitora no puede ir como conductor.
    await expect(firstValueFrom(asignaciones.crear({ ...base, rutaId: 'rut-4', conductorId: 'emp-6' }))).rejects.toThrow(/no es conductor/);
  });

  it('no permite eliminar un vehículo o empleado con asignaciones y lista los conductores con su ruta', async () => {
    const asignaciones = TestBed.inject(AsignacionesRepositorio);
    expect(await firstValueFrom(asignaciones.opciones({ vehiculoId: 'veh-1' }))).toHaveLength(1);

    const conductores = await firstValueFrom(TestBed.inject(ConductoresRepositorio).listar(FILTROS_CONDUCTOR_VACIOS, TODOS));
    expect(conductores.total).toBe(5);
    expect(conductores.items.filter((c) => c.asignacion).length).toBe(3);
  });
});
