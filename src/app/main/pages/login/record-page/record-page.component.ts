import { Component } from '@angular/core';

@Component({
    selector: 'app-record-page',
    templateUrl: './record-page.component.html',
})
export default class RecordPageComponent {
    currentYear: number = new Date().getFullYear();
}
