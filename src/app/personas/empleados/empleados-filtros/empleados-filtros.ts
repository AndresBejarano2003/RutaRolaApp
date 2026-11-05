import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ESTADOS_REGISTRO, EstadoRegistro } from 'src/app/shared/crud/crud';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { FILTROS_EMPLEADO_VACIOS, FiltrosEmpleado, TIPOS_EMPLEADO, TipoEmpleado } from '../empleado';

/** Filtros con búsqueda en vivo (300 ms después de dejar de escribir). */
@Component({
  selector: 'app-empleados-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda],
  templateUrl: './empleados-filtros.html',
})
export class EmpleadosFiltros {
  readonly cambiar = output<FiltrosEmpleado>();

  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly tipos = TIPOS_EMPLEADO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    texto: FILTROS_EMPLEADO_VACIOS.texto,
    tipoEmpleado: FILTROS_EMPLEADO_VACIOS.tipoEmpleado as TipoEmpleado | '',
    estado: FILTROS_EMPLEADO_VACIOS.estado as EstadoRegistro | '',
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
