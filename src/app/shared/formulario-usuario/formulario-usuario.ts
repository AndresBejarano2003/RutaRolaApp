import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ModoFormularioUsuario = 'registro' | 'perfil' | 'edicion';
export type TipoPersona = 'natural' | 'juridica';
type SiNo = 'SI' | 'NO';

export interface PersonaNatural {
  tipoDocumento: string;
  identificacion: string;
  nombres: string;
  fechaNacimiento: string;
  manejaPersonal: SiNo;
  variosVehiculos: SiNo;
  /** Imagen en base64 (data URL). */
  foto: string;
}

export interface PersonaJuridica {
  nit: string;
  digitoVerificacion: string;
  razonSocial: string;
  /** Imagen en base64 (data URL). */
  logo: string;
}

/** Formulario de usuario compartido por registro, perfil y edición. */
@Component({
  selector: 'app-formulario-usuario',
  imports: [FormsModule],
  templateUrl: './formulario-usuario.html',
})
export class FormularioUsuario {
  readonly modo = input<ModoFormularioUsuario>('registro');

  protected tipoPersona: TipoPersona = 'natural';

  protected natural: PersonaNatural = {
    tipoDocumento: '',
    identificacion: '',
    nombres: '',
    fechaNacimiento: '',
    manejaPersonal: 'NO',
    variosVehiculos: 'NO',
    foto: '',
  };

  protected juridica: PersonaJuridica = {
    nit: '',
    digitoVerificacion: '',
    razonSocial: '',
    logo: '',
  };

  protected alSeleccionarArchivo(evento: Event, campo: 'foto' | 'logo'): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) {
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      const dataUrl = lector.result as string;
      if (campo === 'foto') {
        this.natural.foto = dataUrl;
      } else {
        this.juridica.logo = dataUrl;
      }
    };
    lector.readAsDataURL(archivo);
  }

  protected guardar(): void {
    // TODO: enviar al backend cuando exista el endpoint.
    console.log(this.tipoPersona === 'natural' ? this.natural : this.juridica);
  }
}
