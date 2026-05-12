import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * URL base versionada del API (RehabWeb-Api).
 * Las peticiones al backend deben usar URLs absolutas que empiecen con {@link apiBaseUrl}.
 */
@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  /** Sin barra final. */
  readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  /** Concatena un path que empiece con `/` o sin slash. */
  url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${p}`;
  }
}
