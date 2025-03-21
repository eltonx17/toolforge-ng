import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  theme$ = this.themeSubject.asObservable();

  setTheme(theme: string) {
    this.themeSubject.next(theme);
    document.body.setAttribute('cds-theme', theme === 'dark' ? 'dark' : 'light');
  }

  getTheme() {
    return this.themeSubject.value;
  }
}