import { PanelFiltros } from 'src/app/shared/panel-filtros/panel-filtros';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_ACUDIENTE_VACIOS, FiltrosAcudiente } from '../acudiente';

/** Filtros con búsqueda en vivo (300 ms después de dejar de escribir). */
@Component({
  selector: 'app-acudientes-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelFiltros, ReactiveFormsModule, SelectorBusqueda],
  templateUrl: './acudientes-filtros.html',
})
export class AcudientesFiltros {
  readonly cambiar = output<FiltrosAcudiente>();

  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_ACUDIENTE_VACIOS.texto,
    estado: FILTROS_ACUDIENTE_VACIOS.estado as EstadoRegistro | '',
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
