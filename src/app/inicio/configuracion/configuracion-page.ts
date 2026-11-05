import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

const CLAVE_AJUSTES = 'app_settings';

export interface Ajustes {
  // Apariencia
  modoOscuro: boolean;
  menuCompacto: boolean;
  animaciones: boolean;
  // Notificaciones
  notificacionesCorreo: boolean;
  notificacionesPush: boolean;
  notificacionesSonido: boolean;
  // Seguridad
  dobleFactor: boolean;
  minutosSesion: number;
  // Sistema
  idioma: string;
  zonaHoraria: string;
}

const AJUSTES_POR_DEFECTO: Ajustes = {
  modoOscuro: true,
  menuCompacto: false,
  animaciones: true,
  notificacionesCorreo: true,
  notificacionesPush: true,
  notificacionesSonido: false,
  dobleFactor: false,
  minutosSesion: 30,
  idioma: 'es',
  zonaHoraria: 'America/Bogota',
};

@Component({
  selector: 'app-configuracion-page',
  imports: [FormsModule],
  templateUrl: './configuracion-page.html',
})
export default class ConfiguracionPage {
  protected ajustes: Ajustes = { ...AJUSTES_POR_DEFECTO };

  protected guardarAjustes(): void {
    // TODO: persistir en el backend; por ahora solo en este navegador.
    localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(this.ajustes));
  }
}
