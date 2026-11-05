import { Component } from '@angular/core';

@Component({
  selector: 'app-bienvenida-page',
  templateUrl: './bienvenida-page.html',
})
export default class BienvenidaPage {
  protected readonly anioActual = new Date().getFullYear();
}
