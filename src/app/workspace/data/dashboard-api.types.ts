/** Respuesta de `GET /api/v1/me/dashboard/` (`build_dashboard_payload`). */
export interface DashboardApiInactivityPatient {
  patientId: number;
  fullName: string;
  daysSinceLastSession: number | null;
  lastSessionAt: string | null;
}

export interface DashboardApiMetricRow {
  sortOrder: number;
  periodLabel: string;
  metaValue: number | null;
  observedValue: number | null;
  trend?: string;
}

export interface DashboardApiRecentSession {
  id: number;
  patientId: number;
  patientName: string;
  occurredAt: string;
  programLabel: string;
  durationMin: number | null;
  score: number | null;
  status: string;
  adherencePercent: number | null;
}

export interface DashboardApiSummaryRing {
  key: string;
  label: string;
  value: number;
  maxValue: number;
  unit: string;
}

export interface DashboardApiPayload {
  therapistLinked: boolean;
  inactivitySummary: {
    inactiveCount: number;
    thresholdDays: number;
    patients: DashboardApiInactivityPatient[];
  };
  romByWeek: DashboardApiMetricRow[];
  temporalSeries: DashboardApiMetricRow[];
  recentSessions: DashboardApiRecentSession[];
  summaryRings: DashboardApiSummaryRing[];
}
