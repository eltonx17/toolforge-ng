import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MonacoConfig } from './app/monaco-config';

MonacoConfig.configure();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
