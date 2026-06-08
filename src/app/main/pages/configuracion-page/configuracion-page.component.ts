// configuracion-page.component.ts

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-configuracion-page',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './configuracion-page.component.html',
})
export default class ConfiguracionPageComponent {

    // =========================================================
    // CONFIGURACIONES GENERALES
    // =========================================================

    settings = {

        // APARIENCIA
        darkMode: true,
        compactSidebar: false,
        animations: true,

        // NOTIFICACIONES
        emailNotifications: true,
        pushNotifications: true,
        soundNotifications: false,

        // SEGURIDAD
        twoFactorAuth: false,
        sessionTimeout: 30,

        // SISTEMA
        language: 'es',
        timezone: 'America/Bogota',

    };


    // =========================================================
    // GUARDAR
    // =========================================================

    saveSettings() {

        localStorage.setItem(
            'app_settings',
            JSON.stringify(this.settings)
        );

        console.log('Configuraciones guardadas');

    }

}