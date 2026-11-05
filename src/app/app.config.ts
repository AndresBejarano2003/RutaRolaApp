import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // URLs con hash (/#/personas/estudiantes) para servir la app como sitio estático.
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withFetch()),
  ],
};
