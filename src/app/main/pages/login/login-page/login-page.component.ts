import { Component, inject, signal } from '@angular/core';
import { FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { GifService } from 'src/app/main/services/main.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-page',
    imports: [FormsModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})
export default class LoginPageComponent {
    currentYear: number = new Date().getFullYear();
    showSuccess = signal(false);
    showError = signal(false);
    gifService = inject(GifService);
    router = inject(Router);

    loginForms = new FormGroup({
        username: new FormControl("", Validators.required),
        password: new FormControl("", Validators.required)
    });

    onLogin(form: any) {
        const gSesId: string = this.gifService.getValidarUsuario(
            form.username,
            form.password
        );

        if (gSesId != "") {

            this.showError.set(false);
            this.showSuccess.set(true);
            setTimeout(() => {
                this.showSuccess.set(false);
                this.router.navigate(['inicio', gSesId]);
            }, 500);


        } else {
            this.showError.set(true);
            this.showSuccess.set(false);
            setTimeout(() => {
                this.showError.set(false);
            }, 4000);
        }
    }

    showPassword = signal(false);

    togglePassword() {
        this.showPassword.update(value => !value);
    }
}
