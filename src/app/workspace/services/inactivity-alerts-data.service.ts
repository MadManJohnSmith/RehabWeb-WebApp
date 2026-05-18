import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { ApiConfigService } from '../../core/api-config.service';
import type { InactivityAlertsApiResponse } from '../data/inactivity-alerts-api.types';
import type { InactivityAlertsViewDto } from '../data/inactivity-alerts.dto';
import { mapInactivityApiResponseToView } from '../data/inactivity-alerts.mapper';

@Injectable({ providedIn: 'root' })
export class InactivityAlertsDataService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  /**
   * `GET /api/v1/inactivity-alerts/` — requiere token y perfil terapeuta.
   * Si falla la red o el servidor, se devuelve el mock para no dejar la pantalla vacía.
   */
  getAlertsView(): Observable<InactivityAlertsViewDto> {
    return this.http.get<InactivityAlertsApiResponse>(this.api.url('/inactivity-alerts/')).pipe(
      map((payload) => mapInactivityApiResponseToView(payload))
    );
  }
}
