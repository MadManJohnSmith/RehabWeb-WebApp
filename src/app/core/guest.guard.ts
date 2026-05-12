import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenStore } from './auth-token.store';

/** Evita ver el login si ya hay sesión. En servidor deja pasar (prerender de `/login`). */
export const guestGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const tokens = inject(AuthTokenStore);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  if (tokens.hasToken()) {
    return router.createUrlTree(['/app/dashboard']);
  }
  return true;
};
