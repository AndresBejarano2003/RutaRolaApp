import { RepositorioCrud } from 'src/app/shared/crud/repositorio-crud';
import { Factura, FiltrosFactura } from './factura';

/** Token de acceso a datos de facturas (implementación en `core/repositorios.ts`). */
export abstract class FacturasRepositorio extends RepositorioCrud<Factura, FiltrosFactura> {}
