import { Component } from '@angular/core';
import { FormularioUsuario } from 'src/app/shared/formulario-usuario/formulario-usuario';

@Component({
  selector: 'app-perfil-page',
  imports: [FormularioUsuario],
  template: `<app-formulario-usuario modo="perfil" />`,
})
export default class PerfilPage {}
