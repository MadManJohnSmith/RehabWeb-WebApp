import type { InactivityAlertRowDto } from './inactivity-alerts.dto';

/** Coherente con dashboard: mismos pacientes y regla > 3 días sin sesión. */
export const INACTIVITY_ALERTS_MOCK: InactivityAlertRowDto[] = [
  {
    alertId: 'ALT-001',
    patientId: 'p-001',
    patientName: 'James Thornton',
    daysSinceActivity: 7,
    priority: 'alta',
  },
  {
    alertId: 'ALT-002',
    patientId: 'p-002',
    patientName: 'María Santos',
    daysSinceActivity: 5,
    priority: 'alta',
  },
  {
    alertId: 'ALT-003',
    patientId: 'p-004',
    patientName: 'Carlos Méndez',
    daysSinceActivity: 6,
    priority: 'media',
  },
];
