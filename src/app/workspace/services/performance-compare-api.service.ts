import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/api-config.service';
import type {
  PerformanceCompareApiResponse,
  PerformanceCompareRequestBody,
} from '../data/performance-compare-api.types';

@Injectable({ providedIn: 'root' })
export class PerformanceCompareApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  /** `POST /api/v1/performance/compare/` — requiere token y perfil terapeuta. */
  compare(body: PerformanceCompareRequestBody): Observable<PerformanceCompareApiResponse> {
    return this.http.post<PerformanceCompareApiResponse>(this.api.url('/performance/compare/'), body);
  }
}
