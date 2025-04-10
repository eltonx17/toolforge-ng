import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { provideMarkdown, MarkdownModule } from 'ngx-markdown';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import ClipboardJS from 'clipboard';
import { importProvidersFrom } from '@angular/core';

(window as any).ClipboardJS = ClipboardJS;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimationsAsync(),
    provideMonacoEditor(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideHttpClient(),
    provideMarkdown(),
    importProvidersFrom(MarkdownModule.forRoot({
      // You could provide MARKED_OPTIONS here if needed globally
    }))
  ]
};
