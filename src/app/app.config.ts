import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { interceptorAutenticacion } from './core/interceptor-autenticacion';

// Formato colombiano para moneda, números y fechas (pipes currency, number, date).
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // URLs con hash (/#/personas/estudiantes) para servir la app como sitio estático.
    provideRouter(routes, withHashLocation()),
    // Token del API + renovación automática (no hace nada en modo local, sin tokens).
    provideHttpClient(withFetch(), withInterceptors([interceptorAutenticacion])),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
};
