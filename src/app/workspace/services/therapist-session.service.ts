import { Injectable, signal } from '@angular/core';

/**
 * Demo antigua (JWT Bearer simulado). HU-02 usa el token DRF real vía `authHttpInterceptorFn` y
 * {@link ClinicalExportApiService}; conservado solo por referencia en documentación histórica.
 * @deprecated
 */
@Injectable({ providedIn: 'root' })
export class TherapistSessionService {
  /** Token ficticio (no es un JWT real ni está firmado). */
  readonly demoAccessToken = signal(
    'eyJhbGciOiJub25lIn0.eyJyb2wiOiJ0ZXJhcGV1dGEiLCJzdWIiOiJkZW1vLTEifQ.mock-signature',
  );

  readonly demoRole = signal<'terapeuta'>('terapeuta');

  /** Valor listo para `headers.set('Authorization', …)` en peticiones futuras. */
  authorizationHeader(): string {
    return `Bearer ${this.demoAccessToken()}`;
  }
}
