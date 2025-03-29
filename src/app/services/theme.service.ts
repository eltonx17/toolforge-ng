import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'preferred-theme';
  private themeSubject = new BehaviorSubject<string>(this.getStoredTheme());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    // Apply the stored theme on service initialization
    this.setTheme(this.getStoredTheme());
  }

  private getStoredTheme(): string {
    const storedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    if (!storedTheme) {
      // Set dark as default only if no theme is stored
      localStorage.setItem(this.THEME_STORAGE_KEY, 'dark');
      return 'dark';
    }
    return storedTheme;
  }

  setTheme(theme: string) {
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    document.body.setAttribute('cds-theme', theme === 'dark' ? 'dark' : 'light');
  }

  getTheme() {
    return this.themeSubject.value;
  }
}