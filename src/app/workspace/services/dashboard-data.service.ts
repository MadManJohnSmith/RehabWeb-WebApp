import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DASHBOARD_METRICS_MOCK } from '../data/dashboard-metrics.mock';
import type { DashboardMetricsDto } from '../data/dashboard-metrics.dto';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  /** Simula GET agregado hasta existir API real. */
  getDashboardMetrics(): Observable<DashboardMetricsDto> {
    return of(DASHBOARD_METRICS_MOCK);
  }
}
