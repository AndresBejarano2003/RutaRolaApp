import { Component } from '@angular/core';
import { SideMenuComponent } from "../../../components/side-menu/side-menu";

@Component({
    selector: 'app-recover-page',
    templateUrl: './recover-page.component.html',
})
export default class RecoverPageComponent {
    currentYear: number = new Date().getFullYear();
}
