import { Component } from '@angular/core';

@Component({
    selector: 'app-recover-page',
    templateUrl: './recover-page.component.html',
})
export default class RecoverPageComponent {
    currentYear: number = new Date().getFullYear();
}
