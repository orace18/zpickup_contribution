import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

window.addEventListener('error', (event) => {
  if (event.message.includes('Access to fetch') && 
      (event.message.includes('doubleclick') || 
       event.message.includes('youtube'))) {
    event.preventDefault();
    return false;
  }
  return true;
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
