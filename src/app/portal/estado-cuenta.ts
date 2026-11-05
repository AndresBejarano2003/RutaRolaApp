import { Factura, mesesFactura, totalFactura } from 'src/app/finanzas/facturas/factura';
import { Recibo } from 'src/app/finanzas/recibos/recibo';
import { fechaLimiteCuota } from 'src/app/finanzas/reportes/reportes';
import { diasEntre, fechaIso, periodoDe } from 'src/app/shared/fechas/fechas';
import { CuotaPortal, FacturaPortal, ProximoPago, ReciboPortal, ResumenCuenta } from './portal';

const ORDEN_URGENCIA: Record<CuotaPortal['estado'], number> = { VENCIDA: 0, PENDIENTE: 1, PROGRAMADA: 2, PAGADA: 3 };

/**
 * Estado de cuenta de un acudiente (función pura; el API debe aplicar las mismas reglas):
 * cada mes de cada factura vigente queda PAGADA (recibo válido), VENCIDA / PENDIENTE (mes ya
 * iniciado, según la fecha límite de `fechaLimiteCuota`) o PROGRAMADA (mes futuro). Las facturas
 * anuladas se muestran sin cuotas por cobrar y los recibos anulados no cuentan como pago.
 */
export function calcularEstadoCuenta(
  facturas: Factura[],
  recibos: Recibo[],
  diaLimitePorFactura: Map<string, number>,
  ahora = new Date(),
): { facturas: FacturaPortal[]; recibos: ReciboPortal[]; resumen: ResumenCuenta } {
  const hoy = fechaIso(ahora);
  const mesActual = periodoDe(ahora);
  const propias = new Set(facturas.map((f) => f.id));
  const recibosPropios = recibos.filter((r) => propias.has(r.facturaId));
  const validos = new Map(recibosPropios.filter((r) => r.estado === 'ACTIVO').map((r) => [`${r.facturaId}|${r.periodo}`, r]));

  const facturasPortal = facturas
    .map((f): FacturaPortal => {
      const cuotas =
        f.estado === 'ACTIVO'
          ? mesesFactura(f).map((periodo): CuotaPortal => {
              const recibo = validos.get(`${f.id}|${periodo}`) ?? null;
              const fechaLimite = fechaLimiteCuota(periodo, diaLimitePorFactura.get(f.id));
              const diasMora = diasEntre(fechaLimite, hoy);
              const estado = recibo ? 'PAGADA' : periodo > mesActual ? 'PROGRAMADA' : diasMora > 0 ? 'VENCIDA' : 'PENDIENTE';
              return {
                periodo,
                valor: f.valorContratacion,
                estado,
                fechaLimite,
                diasMora: estado === 'VENCIDA' || estado === 'PENDIENTE' ? diasMora : 0,
                recibo: recibo ? { id: recibo.id, numero: recibo.numero, fechaPago: recibo.fechaPago, medioPago: recibo.medioPago } : null,
              };
            })
          : [];
      const suma = (estado: CuotaPortal['estado']) => cuotas.filter((c) => c.estado === estado).reduce((s, c) => s + c.valor, 0);
      return {
        id: f.id,
        numero: f.numero,
        fechaEmision: f.fechaEmision,
        estudianteId: f.estudianteId,
        estudiante: f.nombreEstudiante,
        concepto: f.concepto,
        valorMensual: f.valorContratacion,
        periodoInicio: f.periodoInicio,
        periodoFin: f.periodoFin,
        total: totalFactura(f),
        pagado: suma('PAGADA'),
        vencido: suma('VENCIDA'),
        estado: f.estado,
        cuotas,
      };
    })
    // Vigentes primero; luego por fecha de emisión (más reciente primero).
    .sort((a, b) => a.estado.localeCompare(b.estado) || b.fechaEmision.localeCompare(a.fechaEmision));

  const numeroFactura = new Map(facturas.map((f) => [f.id, f.numero]));
  const recibosPortal = recibosPropios
    .map((r): ReciboPortal => ({
      id: r.id,
      numero: r.numero,
      numeroFactura: r.numeroFactura || (numeroFactura.get(r.facturaId) ?? ''),
      estudiante: r.nombreEstudiante,
      periodo: r.periodo,
      fechaPago: r.fechaPago,
      valor: r.valor,
      medioPago: r.medioPago,
      referencia: r.referencia,
      estado: r.estado,
    }))
    .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago) || b.numero.localeCompare(a.numero));

  const sinPagar = facturasPortal.flatMap((f) =>
    f.cuotas.filter((c) => c.estado !== 'PAGADA').map((c): ProximoPago => ({
      numeroFactura: f.numero,
      estudiante: f.estudiante,
      periodo: c.periodo,
      valor: c.valor,
      fechaLimite: c.fechaLimite,
      estado: c.estado,
    })),
  );
  sinPagar.sort((a, b) => ORDEN_URGENCIA[a.estado] - ORDEN_URGENCIA[b.estado] || a.fechaLimite.localeCompare(b.fechaLimite));
  const vencidas = sinPagar.filter((c) => c.estado === 'VENCIDA');
  const anio = hoy.slice(0, 4);
  const pagosAnio = recibosPortal.filter((r) => r.estado === 'ACTIVO' && r.fechaPago.startsWith(anio));

  return {
    facturas: facturasPortal,
    recibos: recibosPortal,
    resumen: {
      vencido: vencidas.reduce((s, c) => s + c.valor, 0),
      cuotasVencidas: vencidas.length,
      porPagar: sinPagar.filter((c) => c.estado === 'PENDIENTE').reduce((s, c) => s + c.valor, 0),
      proximoPago: sinPagar[0] ?? null,
      pagadoAnio: pagosAnio.reduce((s, r) => s + r.valor, 0),
      pagosAnio: pagosAnio.length,
    },
  };
}
