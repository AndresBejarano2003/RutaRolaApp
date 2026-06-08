import { Component } from '@angular/core';
import { UserFormComponent } from '../../components/user-form/user-form.component';

@Component({
    selector: 'app-perfil-page',
    imports: [UserFormComponent],
    template: `
  
    <app-user-form mode="profile"></app-user-form>

  `,
})
export default class PerfilPageComponent { }