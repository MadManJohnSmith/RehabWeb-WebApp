import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';
import { AuthTokenStore } from './auth-token.store';

/** Respuesta de `POST /api/v1/auth/login/` (DRF `obtain_auth_token`). */
export interface AuthLoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);
  private readonly tokens = inject(AuthTokenStore);

  /**
   * Cuerpo: `username` y `password` según contrato del API (el usuario puede ser correo si así está dado de alta en Django).
   */
  login(username: string, password: string): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(this.api.url('/auth/login/'), { username, password });
  }

  /** Invalida el token en servidor y borra la sesión local. Si no hay sesión, no llama al API. */
  logout(): Observable<unknown> {
    if (!this.tokens.hasToken()) {
      return of(null);
    }
    return this.http.post(this.api.url('/auth/logout/'), {}).pipe(
      finalize(() => {
        this.tokens.clear();
      }),
    );
  }
}
