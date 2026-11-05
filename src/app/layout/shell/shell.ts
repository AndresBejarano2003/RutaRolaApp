import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraSuperior } from '../barra-superior/barra-superior';
import { MenuLateral } from '../menu-lateral/menu-lateral';
import { ContenedorNotificaciones } from 'src/app/shared/notificaciones/contenedor-notificaciones';

/** Layout principal: barra superior + menú lateral (drawer) + contenido. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-shell',
  imports: [RouterOutlet, BarraSuperior, MenuLateral, ContenedorNotificaciones],
  templateUrl: './shell.html',
})
export default class Shell {}
