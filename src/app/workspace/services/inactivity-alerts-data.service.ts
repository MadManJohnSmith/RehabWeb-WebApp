import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { INACTIVITY_ALERTS_MOCK } from '../data/inactivity-alerts.mock';
import type { InactivityAlertRowDto } from '../data/inactivity-alerts.dto';

@Injectable({ providedIn: 'root' })
export class InactivityAlertsDataService {
  /** Simula GET de alertas hasta existir API + Cron en servidor. */
  getAlerts(): Observable<InactivityAlertRowDto[]> {
    return of(INACTIVITY_ALERTS_MOCK);
  }
}
