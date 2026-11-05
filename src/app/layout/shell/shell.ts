import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraSuperior } from '../barra-superior/barra-superior';
import { MenuLateral } from '../menu-lateral/menu-lateral';

/** Layout principal: barra superior + menú lateral (drawer) + contenido. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, BarraSuperior, MenuLateral],
  templateUrl: './shell.html',
})
export default class Shell {}
