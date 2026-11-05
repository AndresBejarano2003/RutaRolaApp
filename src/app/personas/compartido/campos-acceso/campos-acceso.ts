import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { ModoFormulario } from 'src/app/shared/crud/crud';
import { mensajeError } from 'src/app/shared/formularios/formularios';
import { LONGITUD_MINIMA_CONTRASENA } from '../acceso';

/**
 * Sección "Acceso a la app" (usuario, contraseña y confirmación). Se usa DENTRO de un
 * `<form [formGroup]>` con los controles de `controlesAcceso()` y el validador `contrasenasIguales`.
 * En consulta solo muestra el usuario.
 */
@Component({
  selector: 'app-campos-acceso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  viewProviders: [{ provide: ControlContainer, useFactory: () => inject(ControlContainer, { skipSelf: true }) }],
  host: { class: 'contents' },
  templateUrl: './campos-acceso.html',
})
export class CamposAcceso implements OnInit {
  readonly modo = input.required<ModoFormulario>();
  /** Nombre de la app a la que ingresa (p. ej. "Ruta del día", "Portal del acudiente"). */
  readonly app = input.required<string>();

  protected readonly minimo = LONGITUD_MINIMA_CONTRASENA;
  protected readonly mostrar = signal(false);
  protected readonly crear = computed(() => this.modo() === 'crear');
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  private readonly contenedor = inject(ControlContainer);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.contenedor.control?.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
  }

  protected error(campo: 'usuario' | 'contrasena' | 'confirmarContrasena'): string | null {
    const control = this.contenedor.control?.get(campo);
    if (!control || !(control.touched || control.dirty)) return null;
    if (control.hasError('noCoincide')) return 'Las contraseñas no coinciden.';
    if (campo === 'usuario' && control.hasError('pattern')) return 'Entre 4 y 40 caracteres, sin espacios.';
    return mensajeError(control);
  }
}
