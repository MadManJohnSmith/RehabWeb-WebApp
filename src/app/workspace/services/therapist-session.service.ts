import { Injectable, signal } from '@angular/core';

/**
 * Demostración de AC-03 (HU-02): en producción el JWT vendría del login y el backend validaría rol `terapeuta`.
 * Aquí solo se expone el formato de cabecera que usaría `HttpClient` al llamar al endpoint de exportación.
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
