import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CatalogosService } from 'src/app/shared/catalogos/catalogos';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { ESTADOS_ESTUDIANTE, EstadoEstudiante, FILTROS_ESTUDIANTE_VACIOS, FiltrosEstudiante } from '../estudiante';

/** Filtros con búsqueda en vivo (300 ms después de dejar de escribir). */
@Component({
  selector: 'app-estudiantes-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda],
  templateUrl: './estudiantes-filtros.html',
})
export class EstudiantesFiltros {
  readonly cambiar = output<FiltrosEstudiante>();

  protected readonly catalogos = inject(CatalogosService);
  protected readonly estados = ESTADOS_ESTUDIANTE;

  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_ESTUDIANTE_VACIOS.texto,
    colegioId: FILTROS_ESTUDIANTE_VACIOS.colegioId,
    grado: FILTROS_ESTUDIANTE_VACIOS.grado,
    estado: FILTROS_ESTUDIANTE_VACIOS.estado as EstadoEstudiante | '',
  });

  constructor() {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.cambiar.emit(this.form.getRawValue()));
  }

  protected limpiar(): void {
    this.form.reset();
  }
}
