import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const STORAGE_KEY = 'pm-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isDark = signal(false);

  initFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    this.apply(useDark);
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const next = !this.isDark();
    this.apply(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }

  private apply(dark: boolean): void {
    this.isDark.set(dark);
    this.document.documentElement.classList.toggle('dark', dark);
  }
}
