import { Recorrido } from 'src/app/ruta-del-dia/recorrido';
import { RepositorioLectura } from 'src/app/shared/crud/repositorio-crud';
import { FiltrosRecorrido } from './historial-recorridos';

/**
 * Historial de TODOS los recorridos (vista del administrador, solo lectura). Los recorridos
 * los crean conductores y monitoras desde la ruta del día (`RecorridosRepositorio`).
 * Implementación en `core/repositorios.ts`.
 */
export abstract class HistorialRecorridosRepositorio extends RepositorioLectura<Recorrido, FiltrosRecorrido> {}
