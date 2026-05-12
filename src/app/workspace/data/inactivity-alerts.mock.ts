import type { InactivityAlertRowDto, InactivityAlertsViewDto } from './inactivity-alerts.dto';

/** Filas de demostración (IDs numéricos como en el API). */
export const INACTIVITY_ALERTS_MOCK: InactivityAlertRowDto[] = [
  {
    alertId: 'ALT-001',
    patientId: 1,
    patientName: 'James Thornton',
    daysSinceActivity: 7,
    priority: 'alta',
  },
  {
    alertId: 'ALT-002',
    patientId: 2,
    patientName: 'María Santos',
    daysSinceActivity: 5,
    priority: 'alta',
  },
  {
    alertId: 'ALT-003',
    patientId: 4,
    patientName: 'Carlos Méndez',
    daysSinceActivity: 6,
    priority: 'media',
  },
];

/** Valor inicial / fallback cuando no hay API (misma forma que la respuesta mapeada). */
export const INACTIVITY_ALERTS_MOCK_VIEW: InactivityAlertsViewDto = {
  thresholdDays: 3,
  inactiveCount: INACTIVITY_ALERTS_MOCK.length,
  alerts: INACTIVITY_ALERTS_MOCK,
};
