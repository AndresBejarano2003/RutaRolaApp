import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-form',
    imports: [FormsModule],
    templateUrl: './user-form.component.html',
})
export class UserFormComponent {

    @Input() mode: 'register' | 'profile' | 'edit' = 'register';

    // =====================================================
    // VARIABLES
    // =====================================================

    tipoPersona: 'natural' | 'juridica' = 'natural';


    // =====================================================
    // MODELO NATURAL
    // =====================================================

    natural = {
        tipoDocumento: '',
        identificacion: '',
        nombres: '',
        fechaNacimiento: '',
        manejaPersonal: 'NO',
        variosVehiculos: 'NO',
        foto: ''
    };


    // =====================================================
    // MODELO JURÍDICA
    // =====================================================

    juridica = {
        nit: '',
        digitoVerificacion: '',
        razonSocial: '',
        logo: ''
    };


    // =====================================================
    // SUBIR IMAGEN
    // =====================================================

    onFileSelected(event: any, tipo: 'foto' | 'logo') {

        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            if (tipo === 'foto') {
                this.natural.foto = reader.result as string;
            }

            if (tipo === 'logo') {
                this.juridica.logo = reader.result as string;
            }

        };

        reader.readAsDataURL(file);

    }


    // =====================================================
    // GUARDAR
    // =====================================================

    guardarFormulario() {

        if (this.tipoPersona === 'natural') {

            console.log(this.natural);

        } else {

            console.log(this.juridica);

        }

    }

}