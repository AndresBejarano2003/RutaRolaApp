import { Component } from '@angular/core';

@Component({
  selector: 'app-recuperar-page',
  templateUrl: './recuperar-page.html',
})
export default class RecuperarPage {
  protected readonly anioActual = new Date().getFullYear();
}
