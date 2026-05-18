export interface RomWeeklyPointDto {
  weekLabel: string;
  romDegrees: number;
}

export interface TemporalMetricPointDto {
  weekIndex: number;
  weekLabel: string;
  /** Referencia agregada (meta terapéutica). */
  metaValue: number;
  /** Desempeño observado agregado (misma escala que la meta en el mock). */
  observedValue: number;
}

export interface InactivityPatientDto {
  /** Coincide con la ruta `/app/pacientes/:patientId` (ID numérico del API como string). */
  patientId: string;
  name: string;
  days: number;
  condition: string;
  initials: string;
}

export interface SessionRowDto {
  date: string;
  exercise: string;
  score: number;
}

export interface ReportSnippetDto {
  title: string;
  date: string;
  patientId: number;
  patientName: string;
  sessionId: number;
  occurredAt: string;
}

export interface RingMetricDto {
  label: string;
  value: string;
  frac: number;
}

/** Vista de tablero: forma consumida por el template tras mapear `GET /api/v1/me/dashboard/`. */
export interface DashboardMetricsDto {
  inactivityHeadline: string;
  inactivityCount: number;
  inactivityPatients: InactivityPatientDto[];
  ringMetrics: RingMetricDto[];
  temporalSeries: TemporalMetricPointDto[];
  romByWeek: RomWeeklyPointDto[];
  recentSessions: SessionRowDto[];
  reviewToday: string[];
  reportSnippets: ReportSnippetDto[];
}
