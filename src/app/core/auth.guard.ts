import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenStore } from './auth-token.store';

/**
 * Protege rutas del área `/app`. En servidor (prerender) deja pasar; el navegador vuelve a evaluar al hidratar.
 */
export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const tokens = inject(AuthTokenStore);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  if (tokens.hasToken()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
