import { Component } from '@angular/core';
import { SideMenuComponent } from "../../components/side-menu/side-menu";

@Component({
  selector: 'app-inicio-page',
  imports: [SideMenuComponent],
  templateUrl: './inicio-page.component.html',
})
export default class InicioPageComponent {
  currentYear: number = new Date().getFullYear();
}
