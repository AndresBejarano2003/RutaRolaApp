import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { Empresa } from 'src/app/inicio/configuracion/configuracion';
import { ErrorCrud, Pagina, Paginacion } from 'src/app/shared/crud/crud';
import { FuenteLocal, LATENCIA_LOCAL, responderLocal } from 'src/app/shared/crud/repositorio-local';
import { normalizar } from 'src/app/shared/formularios/formularios';
import { FiltrosEmpresa, SolicitudEmpresa } from './empresa';
import { EmpresasRepositorio } from './empresas-repositorio';

const CLAVE = 'rutarola.empresas';
const SEMILLA: Empresa[] = [
  {
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
  },
];

/** TEMPORAL (pruebas y modo local; el super administrador solo existe con el API). NIT único. */
@Injectable()
export class EmpresasLocal extends EmpresasRepositorio implements FuenteLocal {
  readonly modoLocal = true as const;
  private readonly latenciaMs = inject(LATENCIA_LOCAL);

  listar(f: FiltrosEmpresa, { pagina, tamano }: Paginacion): Observable<Pagina<Empresa>> {
    return defer(() =>
      responderLocal(() => {
        const texto = normalizar(f.texto);
        const todas = this.leer()
          .filter((e) => (!texto || normalizar(e.nombre).includes(texto) || e.nit.includes(texto)) && (!f.estado || e.estado === f.estado))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        return { items: todas.slice((pagina - 1) * tamano, pagina * tamano), total: todas.length, pagina, tamano };
      }, this.latenciaMs),
    );
  }

  crear(s: SolicitudEmpresa): Observable<Empresa> {
    return responderLocal(() => {
      const todas = this.leer();
      this.validar(s, null, todas);
      const { administrador: _, ...datos } = s;
      const nueva: Empresa = { ...datos, id: crypto.randomUUID(), fechaCreacion: new Date().toISOString() };
      this.escribir([...todas, nueva]);
      return nueva;
    }, this.latenciaMs);
  }

  actualizar(id: string, s: SolicitudEmpresa): Observable<Empresa> {
    return responderLocal(() => {
      const todas = this.leer();
      const actual = todas.find((e) => e.id === id);
      if (!actual) throw new ErrorCrud('La empresa no existe.', 'NO_ENCONTRADO');
      this.validar(s, id, todas);
      const { administrador: _, ...datos } = s;
      const editada = { ...actual, ...datos };
      this.escribir(todas.map((e) => (e.id === id ? editada : e)));
      return editada;
    }, this.latenciaMs);
  }

  private validar(s: SolicitudEmpresa, id: string | null, todas: Empresa[]): void {
    if (todas.some((e) => e.id !== id && e.nit === s.nit.trim())) {
      throw new ErrorCrud(`Ya existe una empresa con el NIT ${s.nit}.`, 'DUPLICADO');
    }
  }

  private leer(): Empresa[] {
    try {
      return (JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as Empresa[] | null) ?? SEMILLA;
    } catch {
      return SEMILLA;
    }
  }

  private escribir(empresas: Empresa[]): void {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(empresas));
    } catch {
      throw new ErrorCrud('No hay espacio en el almacenamiento temporal del navegador.', 'SIN_ESPACIO');
    }
  }
}
