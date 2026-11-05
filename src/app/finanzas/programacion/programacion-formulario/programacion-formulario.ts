import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Campo, TituloSeccion } from 'src/app/shared/campo/campo';
import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { DatosRegistro, ESTADOS_REGISTRO, EstadoRegistro, ModoFormulario } from 'src/app/shared/crud/crud';
import { mensajeError } from 'src/app/shared/formularios/formularios';
import { SelectorBusqueda } from 'src/app/shared/selector-busqueda/selector-busqueda';
import { PlantillasMensaje } from '../plantillas-mensaje/plantillas-mensaje';
import { DIAS_MES, DIAS_PREVIOS, PlantillaMensaje, Programacion, plantillaEnUso } from '../programacion';

/** Si el canal está activo, debe haber exactamente un mensaje "En uso". */
function unoEnUso(activo: 'whatsapp' | 'email', lista: 'mensajesWhatsapp' | 'correos') {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const encendido = grupo.get(activo)?.value as boolean;
    const plantillas = (grupo.get(lista)?.value ?? []) as PlantillaMensaje[];
    return encendido && plantillas.filter((p) => p.estado === 'EN_USO').length !== 1 ? { [`${activo}SinMensaje`]: true } : null;
  };
}

@Component({
  selector: 'app-programacion-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorBusqueda, Campo, TituloSeccion, PlantillasMensaje],
  templateUrl: './programacion-formulario.html',
})
export class ProgramacionFormulario {
  readonly idFormulario = input.required<string>();
  readonly programacion = input<Programacion | null>(null);
  readonly modo = input.required<ModoFormulario>();
  readonly facturas = input<OpcionCatalogo[]>([]);
  readonly guardar = output<DatosRegistro<Programacion>>();

  protected readonly dias = DIAS_MES;
  protected readonly diasPrevios = DIAS_PREVIOS;
  protected readonly estados = ESTADOS_REGISTRO;
  protected readonly soloLectura = computed(() => this.modo() === 'consultar');

  /** Paneles "Parametrizar mensaje de WhatsApp" y "Parametrizar cuerpo del correo". */
  protected readonly panelWhatsapp = signal(false);
  protected readonly panelCorreo = signal(false);

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      facturaId: ['', Validators.required],
      diaLimitePago: ['', Validators.required],
      diasPrevios: ['', Validators.required],
      whatsapp: this.fb.control(false),
      mensajesWhatsapp: this.fb.control<PlantillaMensaje[]>([]),
      email: this.fb.control(false),
      correos: this.fb.control<PlantillaMensaje[]>([]),
      estado: this.fb.control<EstadoRegistro>('ACTIVO', Validators.required),
    },
    { validators: [unoEnUso('whatsapp', 'mensajesWhatsapp'), unoEnUso('email', 'correos')] },
  );

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly whatsapp = computed(() => !!this.valores().whatsapp);
  protected readonly email = computed(() => !!this.valores().email);
  protected readonly resumenWhatsapp = computed(() => this.resumen(this.valores().mensajesWhatsapp ?? []));
  protected readonly resumenCorreo = computed(() => this.resumen(this.valores().correos ?? []));
  protected readonly intentoGuardar = signal(false);

  constructor() {
    effect(() => {
      const p = this.programacion();
      if (p) {
        const { id: _id, fechaCreacion: _c, fechaActualizacion: _a, numeroFactura: _n, ...datos } = p;
        this.form.reset({ ...datos, diaLimitePago: String(datos.diaLimitePago), diasPrevios: String(datos.diasPrevios) });
      } else {
        this.form.reset();
      }
      this.panelWhatsapp.set(false);
      this.panelCorreo.set(false);
      this.intentoGuardar.set(false);
      if (this.soloLectura()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  protected error(campo: keyof typeof this.form.controls): string | null {
    return mensajeError(this.form.controls[campo]);
  }

  protected errorCanal(canal: 'whatsapp' | 'email'): string | null {
    if (!this.intentoGuardar() || !this.form.errors?.[`${canal}SinMensaje`]) return null;
    return canal === 'whatsapp'
      ? 'Parametriza al menos un mensaje de WhatsApp y márcalo "En uso".'
      : 'Parametriza al menos un correo y márcalo "En uso".';
  }

  protected enviar(): void {
    this.intentoGuardar.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.errorCanal('whatsapp')) this.panelWhatsapp.set(true);
      if (this.errorCanal('email')) this.panelCorreo.set(true);
      return;
    }
    const v = this.form.getRawValue();
    const factura = this.facturas().find((f) => f.id === v.facturaId);
    this.guardar.emit({
      ...v,
      nombre: v.nombre.trim(),
      numeroFactura: factura?.nombre.split(' · ')[0] ?? this.programacion()?.numeroFactura ?? '',
      diaLimitePago: Number(v.diaLimitePago),
      diasPrevios: Number(v.diasPrevios),
    });
  }

  private resumen(plantillas: PlantillaMensaje[]): string {
    if (!plantillas.length) return 'Sin mensajes';
    return `${plantillas.length} predefinido(s) · ${plantillaEnUso(plantillas) ? '1 en uso' : 'ninguno en uso'}`;
  }
}
