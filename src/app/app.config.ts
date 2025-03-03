import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from '../core/services/api.service';
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideAnimationsAsync(),
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    { 
      provide: TINYMCE_SCRIPT_SRC, 
      useValue: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js'
    },
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireMessagingModule
    )
  ]
};