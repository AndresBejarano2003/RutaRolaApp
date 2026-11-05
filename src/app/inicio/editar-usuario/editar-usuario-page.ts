import { Component } from '@angular/core';
import { FormularioUsuario } from 'src/app/shared/formulario-usuario/formulario-usuario';

@Component({
  selector: 'app-editar-usuario-page',
  imports: [FormularioUsuario],
  template: `<app-formulario-usuario modo="edicion" />`,
})
export default class EditarUsuarioPage {}
