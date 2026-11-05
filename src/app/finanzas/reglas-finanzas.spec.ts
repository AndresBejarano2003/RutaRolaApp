import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DatosRegistro } from 'src/app/shared/crud/crud';
import { periodoDe } from 'src/app/shared/fechas/fechas';
import { repositoriosDePrueba } from 'src/app/shared/pruebas/pruebas';
import { calcularTotal } from './cotizaciones/cotizacion';
import { CotizacionesRepositorio } from './cotizaciones/cotizaciones-repositorio';
import { Factura } from './facturas/factura';
import { FacturasRepositorio } from './facturas/facturas-repositorio';
import { Programacion } from './programacion/programacion';
import { ProgramacionesRepositorio } from './programacion/programaciones-repositorio';
import { Recibo } from './recibos/recibo';
import { RecibosRepositorio } from './recibos/recibos-repositorio';
import { ReportesRepositorio } from './reportes/reportes-repositorio';

const FACTURA: DatosRegistro<Factura> = {
  numero: '',
  fechaEmision: '2026-11-01',
  acudienteId: 'acu-1',
  estudianteId: 'est-1',
  nombreAcudiente: 'María Pérez López',
  nombreEstudiante: 'Juan Sebastián Pérez López',
  valorContratacion: 420000,
  periodoInicio: '2026-11',
  periodoFin: '2026-11',
  concepto: 'Transporte escolar',
  estado: 'ACTIVO',
  observaciones: '',
};

describe('Reglas de negocio de Finanzas', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: repositoriosDePrueba() });
  });

  it('la cotización calcula el total como valor por estudiante × estudiantes y asigna consecutivo', async () => {
    expect(calcularTotal(400000, 3)).toBe(1200000);
    const creada = await firstValueFrom(
      TestBed.inject(CotizacionesRepositorio).crear({
        numero: '',
        fecha: '2026-11-05',
        registrados: false,
        acudienteId: null,
        nombreAcudiente: 'Cliente Nuevo',
        telefonoAcudiente: '3000000000',
        estudiantes: [
          { estudianteId: null, nombre: 'Uno' },
          { estudianteId: null, nombre: 'Dos' },
        ],
        valorPorEstudiante: 350000,
        valorTotal: 0,
        estado: 'PENDIENTE',
        observaciones: '',
      }),
    );
    expect(creada.valorTotal).toBe(700000);
    expect(creada.numero).toMatch(/^COT-\d{4}$/);
  });

  it('la factura exige que el estudiante sea del acudiente y no se cruce con otra vigente', async () => {
    const facturas = TestBed.inject(FacturasRepositorio);
    await expect(firstValueFrom(facturas.crear(FACTURA))).rejects.toBeTruthy(); // est-1 ya tiene fac-1 vigente
    await expect(
      firstValueFrom(facturas.crear({ ...FACTURA, estudianteId: 'est-3', nombreEstudiante: 'Samuel', periodoInicio: '2027-01', periodoFin: '2027-02' })),
    ).rejects.toThrow(/no está a cargo/);
    const creada = await firstValueFrom(facturas.crear({ ...FACTURA, periodoInicio: '2027-01', periodoFin: '2027-11' }));
    expect(creada.numero).toBe('FAC-0007');
  });

  it('no permite eliminar una factura con recibos ni pagar dos veces el mismo mes', async () => {
    const facturas = TestBed.inject(FacturasRepositorio);
    await expect(firstValueFrom(facturas.eliminar('fac-1'))).rejects.toMatchObject({ codigo: 'EN_USO' });

    const recibo: DatosRegistro<Recibo> = {
      numero: '',
      facturaId: 'fac-1',
      numeroFactura: 'FAC-0001',
      nombreAcudiente: 'María Pérez López',
      nombreEstudiante: 'Juan Sebastián Pérez López',
      periodo: '2026-02',
      fechaPago: '2026-02-03',
      valor: 420000,
      medioPago: 'EFECTIVO',
      referencia: '',
      estado: 'ACTIVO',
      observaciones: '',
    };
    await expect(firstValueFrom(TestBed.inject(RecibosRepositorio).crear(recibo))).rejects.toMatchObject({ codigo: 'DUPLICADO' });
  });

  it('la programación exige exactamente un mensaje "En uso" por canal y una por factura', async () => {
    const programaciones = TestBed.inject(ProgramacionesRepositorio);
    const datos: DatosRegistro<Programacion> = {
      nombre: 'Prueba',
      facturaId: 'fac-3',
      numeroFactura: 'FAC-0003',
      diaLimitePago: 5,
      diasPrevios: 3,
      whatsapp: true,
      mensajesWhatsapp: [{ id: 'm1', asunto: '', cuerpo: 'Hola {acudiente}', adjuntos: [], estado: 'ACTIVO' }],
      email: false,
      correos: [],
      estado: 'ACTIVO',
    };
    await expect(firstValueFrom(programaciones.crear(datos))).rejects.toThrow(/En uso/);
    await expect(firstValueFrom(programaciones.crear({ ...datos, whatsapp: false }))).rejects.toThrow(/WhatsApp, correo o ambos/);
    await expect(firstValueFrom(programaciones.crear({ ...datos, facturaId: 'fac-1' }))).rejects.toMatchObject({ codigo: 'DUPLICADO' });

    const creada = await firstValueFrom(
      programaciones.crear({ ...datos, mensajesWhatsapp: [{ ...datos.mensajesWhatsapp[0], estado: 'EN_USO' }] }),
    );
    expect(await firstValueFrom(programaciones.historial(creada.id))).toEqual([]);
  });

  it('los reportes se calculan con las facturas, recibos y programaciones', async () => {
    const reportes = TestBed.inject(ReportesRepositorio);
    const ingresos = await firstValueFrom(reportes.ingresos({ desde: '2026-01', hasta: periodoDe(), medioPago: '' }));
    expect(ingresos.cantidad).toBeGreaterThan(0);
    expect(ingresos.total).toBe(ingresos.porMes.reduce((s, m) => s + m.total, 0));

    const pendientes = await firstValueFrom(reportes.pendientes({ texto: '', acudienteId: '', situacion: '' }));
    expect(pendientes.every((c) => c.periodo <= periodoDe())).toBe(true);

    const morosos = await firstValueFrom(reportes.morosos({ texto: '', diasMinimos: 0 }));
    expect(morosos.every((m) => m.diasMoraMaxima > 0 && m.valorAdeudado > 0)).toBe(true);
    // Ordenados de mayor a menor mora.
    expect(morosos.map((m) => m.diasMoraMaxima)).toEqual([...morosos.map((m) => m.diasMoraMaxima)].sort((a, b) => b - a));
  });
});
