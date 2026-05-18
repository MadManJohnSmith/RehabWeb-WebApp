import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from '../../core/api-config.service';
import type { DashboardApiPayload } from '../data/dashboard-api.types';
import type { DashboardMetricsDto } from '../data/dashboard-metrics.dto';
import { mapDashboardApiToDto } from '../data/dashboard-metrics.mapper';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  /** `GET /api/v1/me/dashboard/` — requiere token; si falla la red, se usa el mock como respaldo. */
  getDashboardMetrics(): Observable<DashboardMetricsDto> {
    return this.http.get<DashboardApiPayload>(this.api.url('/me/dashboard/')).pipe(
      map((payload) => mapDashboardApiToDto(payload))
    );
  }
}
