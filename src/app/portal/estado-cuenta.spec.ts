import { Factura } from 'src/app/finanzas/facturas/factura';
import { Recibo } from 'src/app/finanzas/recibos/recibo';
import { calcularEstadoCuenta } from './estado-cuenta';

const AHORA = new Date('2026-11-05T10:00:00');
const factura = (id: string, inicio: string, fin: string, estado: Factura['estado'] = 'ACTIVO') =>
  ({ id, numero: id, fechaEmision: '2026-01-10', estudianteId: 'e1', nombreEstudiante: 'Ana', valorContratacion: 100, periodoInicio: inicio, periodoFin: fin, concepto: '', estado }) as Factura;
const recibo = (id: string, facturaId: string, periodo: string, fechaPago: string, estado: Recibo['estado'] = 'ACTIVO') =>
  ({ id, numero: id, facturaId, numeroFactura: facturaId, nombreEstudiante: 'Ana', periodo, fechaPago, valor: 100, medioPago: 'NEQUI', referencia: '', estado }) as Recibo;

describe('calcularEstadoCuenta', () => {
  it('clasifica cada mes como pagado, vencido, por pagar o próximo', () => {
    const { facturas, resumen } = calcularEstadoCuenta(
      [factura('F1', '2026-09', '2026-12')],
      [recibo('R1', 'F1', '2026-09', '2026-09-03'), recibo('R2', 'F1', '2026-10', '2026-10-02', 'INACTIVO')],
      new Map([['F1', 10]]),
      AHORA,
    );
    expect(facturas[0].cuotas.map((c) => [c.periodo, c.estado])).toEqual([
      ['2026-09', 'PAGADA'],
      ['2026-10', 'VENCIDA'], // el recibo anulado no cuenta
      ['2026-11', 'PENDIENTE'], // día límite 10 (programación): aún en plazo el 5
      ['2026-12', 'PROGRAMADA'],
    ]);
    expect(facturas[0]).toMatchObject({ total: 400, pagado: 100, vencido: 100 });
    expect(resumen).toEqual({
      vencido: 100,
      cuotasVencidas: 1,
      porPagar: 100,
      proximoPago: { numeroFactura: 'F1', estudiante: 'Ana', periodo: '2026-10', valor: 100, fechaLimite: '2026-10-10', estado: 'VENCIDA' },
      pagadoAnio: 100,
      pagosAnio: 1,
    });
  });

  it('sin programación vence el día 5; las facturas anuladas no cobran y solo cuentan recibos propios', () => {
    const { facturas, recibos, resumen } = calcularEstadoCuenta(
      [factura('F1', '2026-11', '2026-11'), factura('F2', '2026-01', '2026-12', 'INACTIVO')],
      [recibo('R9', 'OTRA', '2026-11', '2026-11-01')],
      new Map(),
      new Date('2026-11-06T08:00:00'),
    );
    expect(facturas.map((f) => f.id)).toEqual(['F1', 'F2']);
    expect(facturas[0].cuotas[0]).toMatchObject({ estado: 'VENCIDA', fechaLimite: '2026-11-05', diasMora: 1 });
    expect(facturas[1].cuotas).toEqual([]);
    expect(recibos).toEqual([]);
    expect(resumen.vencido).toBe(100);
  });
});
