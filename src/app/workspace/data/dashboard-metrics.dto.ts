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
  /** Coincide con la ruta `/app/pacientes/:patientId` (mock). */
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
}

export interface RingMetricDto {
  label: string;
  value: string;
  frac: number;
}

/** Simula el payload JSON que devolvería un endpoint agregado del tablero. */
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
