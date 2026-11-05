import { Component } from '@angular/core';
import { FormularioUsuario } from 'src/app/shared/formulario-usuario/formulario-usuario';

@Component({
  selector: 'app-registro-page',
  imports: [FormularioUsuario],
  template: `<app-formulario-usuario modo="registro" />`,
})
export default class RegistroPage {}
