import { Component } from '@angular/core';
import { SideMenuComponent } from "../../../components/side-menu/side-menu";

@Component({
    selector: 'app-record-page',
    templateUrl: './record-page.component.html',
})
export default class RecordPageComponent {
    currentYear: number = new Date().getFullYear();
}
