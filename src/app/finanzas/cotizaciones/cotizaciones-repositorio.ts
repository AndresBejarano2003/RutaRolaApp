import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { Cotizacion, FiltrosCotizacion } from './cotizacion';

/** Token de acceso a datos de cotizaciones (implementación en `core/repositorios.ts`). */
export abstract class CotizacionesRepositorio extends RepositorioCrud<Cotizacion, FiltrosCotizacion> {}
