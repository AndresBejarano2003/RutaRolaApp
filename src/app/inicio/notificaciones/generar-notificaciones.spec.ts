import { Factura } from 'src/app/finanzas/facturas/factura';
import { Recibo } from 'src/app/finanzas/recibos/recibo';
import { Vehiculo } from 'src/app/operacion/vehiculos/vehiculo';
import { Empleado } from 'src/app/personas/empleados/empleado';
import { DatosNotificables, generarNotificaciones } from './generar-notificaciones';

const AHORA = new Date('2026-11-05T10:00:00');

const vacios = (): DatosNotificables => ({
  vehiculos: [],
  empleados: [],
  facturas: [],
  recibos: [],
  cotizaciones: [],
  envios: [],
  morosos: [],
});

const vehiculo = (cambios: Partial<Vehiculo>): Vehiculo =>
  ({
    id: 'v1',
    placa: 'ABC123',
    numeroInterno: '07',
    tipo: 'BUS',
    marca: 'Chevrolet',
    linea: 'NPR',
    modelo: 2022,
    capacidad: 30,
    vencimientoSoat: '2027-06-01',
    vencimientoTecnomecanica: '2027-06-01',
    vencimientoTarjetaOperacion: '2027-06-01',
    vencimientoPolizas: '2027-06-01',
    estado: 'ACTIVO',
    fechaCreacion: '2026-01-01T00:00:00Z',
    ...cambios,
  }) as Vehiculo;

describe('generarNotificaciones', () => {
  it('alerta documentos de vehículo vencidos (crítica) y por vencer (advertencia)', () => {
    const datos = { ...vacios(), vehiculos: [vehiculo({ vencimientoSoat: '2026-10-01', vencimientoPolizas: '2026-11-20' })] };
    const resultado = generarNotificaciones(datos, AHORA);
    expect(resultado.find((n) => n.titulo.startsWith('SOAT vencido'))?.nivel).toBe('CRITICA');
    expect(resultado.find((n) => n.titulo.startsWith('Pólizas por vencer'))?.nivel).toBe('ADVERTENCIA');
    expect(resultado.every((n) => n.categoria === 'VENCIMIENTOS')).toBe(true);
  });

  it('no alerta vehículos inactivos y notifica el registro solo si es reciente', () => {
    const inactivo = vehiculo({ estado: 'INACTIVO', vencimientoSoat: '2026-10-01' });
    expect(generarNotificaciones({ ...vacios(), vehiculos: [inactivo] }, AHORA)).toEqual([]);

    const nuevo = vehiculo({ fechaCreacion: '2026-11-04T15:00:00Z' });
    const [registro] = generarNotificaciones({ ...vacios(), vehiculos: [nuevo] }, AHORA);
    expect(registro.titulo).toBe('Vehículo registrado · ABC123');
    expect(registro.enlace).toBe('/operacion/vehiculos');
  });

  it('alerta la licencia vencida de un conductor activo', () => {
    const conductor = {
      id: 'e1',
      primerNombre: 'Luis',
      primerApellido: 'Gómez',
      tipoDocumento: 'CC',
      numeroDocumento: '123',
      tipoEmpleado: 'CONDUCTOR',
      numeroLicencia: '999',
      categoriaLicencia: 'C2',
      vencimientoLicencia: '2026-11-01',
      estado: 'ACTIVO',
      fechaCreacion: '2026-01-01T00:00:00Z',
    } as Empleado;
    const [n] = generarNotificaciones({ ...vacios(), empleados: [conductor] }, AHORA);
    expect(n.nivel).toBe('CRITICA');
    expect(n.clave).toBe('licencia:e1:2026-11-01:VENCIDA');
    expect(n.mensaje).toContain('hace 4 días');
  });

  it('notifica pagos recientes y contratos por terminar o terminados', () => {
    const recibo = (id: string, fechaCreacion: string) =>
      ({ id, numero: id, estado: 'ACTIVO', fechaCreacion, valor: 100000, periodo: '2026-11', medioPago: 'NEQUI' }) as Recibo;
    const factura = (id: string, periodoFin: string) =>
      ({ id, numero: id, estado: 'ACTIVO', periodoInicio: '2026-01', periodoFin, fechaEmision: '2026-01-01', fechaCreacion: '2026-01-01T00:00:00Z' }) as Factura;

    const resultado = generarNotificaciones(
      {
        ...vacios(),
        recibos: [recibo('REC-1', '2026-11-03T10:00:00Z'), recibo('REC-VIEJO', '2026-06-01T10:00:00Z')],
        facturas: [factura('FAC-1', '2026-11'), factura('FAC-2', '2026-09'), factura('FAC-3', '2027-06')],
      },
      AHORA,
    );
    const titulos = resultado.map((n) => n.titulo);
    expect(titulos).toContain('Pago recibido · REC-1');
    expect(titulos).not.toContain('Pago recibido · REC-VIEJO');
    expect(titulos).toContain('Contrato por terminar · FAC-1');
    expect(titulos).toContain('Contrato terminado · FAC-2');
    expect(titulos.some((t) => t.includes('FAC-3'))).toBe(false);
  });

  it('cada hecho tiene una clave única', () => {
    const datos = { ...vacios(), vehiculos: [vehiculo({ vencimientoSoat: '2026-10-01', vencimientoTecnomecanica: '2026-10-01' })] };
    const claves = generarNotificaciones(datos, AHORA).map((n) => n.clave);
    expect(new Set(claves).size).toBe(claves.length);
  });
});
