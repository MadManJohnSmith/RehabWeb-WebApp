import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from '../../core/api-config.service';
import type { InactivityAlertsApiResponse } from '../data/inactivity-alerts-api.types';
import type { InactivityAlertsViewDto } from '../data/inactivity-alerts.dto';
import { mapInactivityApiResponseToView } from '../data/inactivity-alerts.mapper';

@Injectable({ providedIn: 'root' })
export class InactivityAlertsDataService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  /** `GET /api/v1/inactivity-alerts/` — requiere token. Errores los maneja la pantalla (HU-07 AC-03). */
  getAlertsView(): Observable<InactivityAlertsViewDto> {
    return this.http
      .get<InactivityAlertsApiResponse>(this.api.url('/inactivity-alerts/'))
      .pipe(map((payload) => mapInactivityApiResponseToView(payload)));
  }
}
