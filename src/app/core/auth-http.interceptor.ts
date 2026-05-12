import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { AuthTokenStore } from './auth-token.store';

/**
 * Añade `Authorization: Token …` hacia el API; ante **401** limpia sesión y envía a `/login`
 * (excepto en fallo de propio `auth/login`).
 */
export const authHttpInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const api = inject(ApiConfigService);
  const base = api.apiBaseUrl;
  if (!req.url.startsWith(base)) {
    return next(req);
  }

  const pathFromBase = req.url.slice(base.length);
  const isLogin = pathFromBase.startsWith('/auth/login');

  const token = inject(AuthTokenStore).getToken();
  const authReq =
    token && !isLogin ? req.clone({ setHeaders: { Authorization: `Token ${token}` } }) : req;

  const router = inject(Router);
  const tokenStore = inject(AuthTokenStore);

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && req.url.startsWith(base) && !isLogin) {
        tokenStore.clear();
        if (!router.url.startsWith('/login')) {
          void router.navigateByUrl('/login');
        }
      }
      return throwError(() => err);
    }),
  );
};
