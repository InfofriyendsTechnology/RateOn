import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();

  private readonly THEME_KEY = 'rateon_theme';

  constructor() {
    this.loadThemeFromStorage();
  }

  private loadThemeFromStorage(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const isDark = savedTheme === 'dark';
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.setTheme(newTheme);
  }

  setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
