import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { ErrorCrud } from 'src/app/shared/crud/crud';
import { FuenteLocal, LATENCIA_LOCAL, responderLocal } from 'src/app/shared/crud/repositorio-local';
import { DatosEmpresa, Empresa, PARAMETROS_PREDETERMINADOS, Parametro } from './configuracion';
import { ConfiguracionRepositorio } from './configuracion-repositorio';

const CLAVE_EMPRESA = 'rutarola.empresa';
const CLAVE_PARAMETROS = 'rutarola.configuracion';

const EMPRESA_DEMO: Empresa = {
  id: 'empresa-local',
  nombre: 'RutaRola Demo',
  nit: '900000001-1',
  direccion: '',
  ciudad: 'Bogotá',
  telefono: '',
  email: 'admin@rutarola.com',
  logoUrl: '',
  estado: 'ACTIVO',
  fechaCreacion: '2026-01-01T00:00:00Z',
};

/**
 * Almacenamiento TEMPORAL en `localStorage`. En modo local los parámetros se guardan, pero los cálculos
 * del navegador (reportes, portal, alertas) siguen usando los valores por defecto (día 5 y 30 días);
 * con el API los aplica el servidor.
 */
@Injectable()
export class ConfiguracionLocal extends ConfiguracionRepositorio implements FuenteLocal {
  readonly modoLocal = true as const;
  private readonly latenciaMs = inject(LATENCIA_LOCAL);

  empresa(): Observable<Empresa> {
    return defer(() => responderLocal(() => this.leerEmpresa(), this.latenciaMs));
  }

  guardarEmpresa(datos: DatosEmpresa): Observable<Empresa> {
    return responderLocal(() => {
      if (!datos.nombre.trim()) throw new ErrorCrud('Ingresa el nombre de la empresa.', 'VALIDACION');
      const empresa = { ...this.leerEmpresa(), ...datos, nombre: datos.nombre.trim() };
      guardar(CLAVE_EMPRESA, empresa);
      return empresa;
    }, this.latenciaMs);
  }

  parametros(): Observable<Parametro[]> {
    return defer(() => responderLocal(() => this.leerParametros(), this.latenciaMs));
  }

  guardarParametro(clave: string, valor: string): Observable<Parametro> {
    return responderLocal(() => {
      const base = PARAMETROS_PREDETERMINADOS.find((p) => p.clave === clave);
      if (!base) throw new ErrorCrud(`El parámetro "${clave}" no existe.`, 'NO_ENCONTRADO');
      const numero = Number(valor);
      if (!Number.isInteger(numero) || numero < base.minimo || numero > base.maximo) {
        throw new ErrorCrud(`El valor debe ser un número entero entre ${base.minimo} y ${base.maximo}.`, 'VALIDACION');
      }
      const guardados = leer<Record<string, string>>(CLAVE_PARAMETROS, {});
      guardar(CLAVE_PARAMETROS, { ...guardados, [clave]: String(numero) });
      return { ...base, valor: String(numero) };
    }, this.latenciaMs);
  }

  private leerEmpresa(): Empresa {
    return { ...EMPRESA_DEMO, ...leer<Partial<Empresa>>(CLAVE_EMPRESA, {}) };
  }

  private leerParametros(): Parametro[] {
    const guardados = leer<Record<string, string>>(CLAVE_PARAMETROS, {});
    return PARAMETROS_PREDETERMINADOS.map((p) => ({ ...p, valor: guardados[p.clave] ?? p.valor }));
  }
}

function leer<T>(clave: string, vacio: T): T {
  try {
    return (JSON.parse(localStorage.getItem(clave) ?? 'null') as T | null) ?? vacio;
  } catch {
    return vacio;
  }
}

function guardar(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    throw new ErrorCrud('No hay espacio en el almacenamiento temporal del navegador.', 'SIN_ESPACIO');
  }
}
