import type { InactivityAlertApiItem, InactivityAlertsApiResponse } from './inactivity-alerts-api.types';
import type { InactivityAlertPriority, InactivityAlertRowDto, InactivityAlertsViewDto } from './inactivity-alerts.dto';

/**
 * El API no envía prioridad. Regla de presentación: **alta** si nunca hubo sesión
 * (`daysSinceLastSession === null`) o lleva ≥7 días; en caso contrario **media**.
 */
function mapPriority(daysSinceLastSession: number | null): InactivityAlertPriority {
  if (daysSinceLastSession === null || daysSinceLastSession >= 7) {
    return 'alta';
  }
  return 'media';
}

export function mapInactivityApiItemToRow(row: InactivityAlertApiItem): InactivityAlertRowDto {
  return {
    alertId: `inact-${row.patientId}`,
    patientId: row.patientId,
    patientName: row.fullName,
    daysSinceActivity: row.daysSinceLastSession,
    priority: mapPriority(row.daysSinceLastSession),
  };
}

export function mapInactivityApiResponseToView(res: InactivityAlertsApiResponse): InactivityAlertsViewDto {
  return {
    thresholdDays: res.thresholdDays,
    inactiveCount: res.inactiveCount,
    alerts: res.alerts.map(mapInactivityApiItemToRow),
  };
}
