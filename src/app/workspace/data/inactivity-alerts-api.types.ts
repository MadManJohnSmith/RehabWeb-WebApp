/** Elemento de `alerts` en `GET /api/v1/inactivity-alerts/` (ver `get_inactive_patients_for_therapist`). */
export interface InactivityAlertApiItem {
  patientId: number;
  fullName: string;
  daysSinceLastSession: number | null;
  lastSessionAt: string | null;
}

export interface InactivityAlertsApiResponse {
  thresholdDays: number;
  inactiveCount: number;
  alerts: InactivityAlertApiItem[];
}
