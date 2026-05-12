import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

/** Smoke test contra `GET /api/v1/health/` (público en el API). */
@Injectable({ providedIn: 'root' })
export class ApiHealthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  ping(): Observable<unknown> {
    return this.http.get(this.api.url('/health/'));
  }
}
