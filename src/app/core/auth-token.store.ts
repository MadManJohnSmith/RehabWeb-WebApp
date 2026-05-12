import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const LS_KEY = 'rehabweb.auth.token';

/**
 * Persistencia del token DRF (`Authorization: Token …`).
 * Solo navegador — en SSR no lee ni escribe.
 * {@link hasToken} mantiene el estado para guards sin depender solo de lecturas async.
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly platformId = inject(PLATFORM_ID);

  /** Sincronizado con `localStorage` en el cliente. */
  readonly hasToken = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.hasToken.set(!!localStorage.getItem(LS_KEY));
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(LS_KEY);
  }

  setToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(LS_KEY, token);
    this.hasToken.set(true);
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(LS_KEY);
    this.hasToken.set(false);
  }
}
