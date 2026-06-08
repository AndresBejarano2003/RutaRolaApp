import { Component } from '@angular/core';
import { UserFormComponent } from '../../components/user-form/user-form.component';

@Component({
    selector: 'app-registro-page',
    imports: [UserFormComponent],
    template: `
  
    <app-user-form mode="register"></app-user-form>

  `,
})
export default class RegistroPageComponent { }