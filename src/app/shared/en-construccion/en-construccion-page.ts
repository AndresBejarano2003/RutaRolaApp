import { Component } from '@angular/core';

/**
 * Esqueleto de carga para módulos que todavía no tienen contenido.
 * Cuando una página esté lista, cambiar su `loadComponent` en el
 * `*.routes.ts` del módulo para que apunte a la página real.
 */
@Component({
  selector: 'app-en-construccion-page',
  templateUrl: './en-construccion-page.html',
})
export default class EnConstruccionPage {}
