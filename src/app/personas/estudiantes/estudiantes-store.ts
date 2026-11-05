import { Injectable, inject } from '@angular/core';
import { CrudStore } from 'src/app/shared/crud/crud-store';
import { Estudiante, FILTROS_ESTUDIANTE_VACIOS, FiltrosEstudiante } from './estudiante';
import { EstudiantesRepositorio } from './estudiantes-repositorio';

@Injectable()
export class EstudiantesStore extends CrudStore<Estudiante, FiltrosEstudiante> {
  protected readonly repositorio = inject(EstudiantesRepositorio);
  protected readonly textos = {
    creado: 'Estudiante registrado correctamente.',
    actualizado: 'Estudiante actualizado correctamente.',
    eliminado: 'Estudiante eliminado.',
  };

  constructor() {
    super(FILTROS_ESTUDIANTE_VACIOS);
  }
}
