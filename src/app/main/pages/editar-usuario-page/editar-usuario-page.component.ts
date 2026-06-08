import { Component } from '@angular/core';
import { UserFormComponent } from '../../components/user-form/user-form.component';

@Component({
    selector: 'app-editar-usuario-page',
    imports: [UserFormComponent],
    template: `
  
    <app-user-form mode="edit"></app-user-form>

  `,
})
export default class EditarUsuarioPageComponent { }