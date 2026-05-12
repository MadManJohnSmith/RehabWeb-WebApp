/** Punto de serie temporal (métrica temporal del paciente). */
export interface PerformanceCompareTemporalPoint {
  sortOrder: number;
  periodLabel: string;
  metaValue: number;
  observedValue: number;
  trend: string;
}

export interface PerformanceComparePatientSummary {
  formulaVersion?: string;
  initialMeta?: number | null;
  initialObserved?: number | null;
  finalMeta?: number | null;
  finalObserved?: number | null;
  initialPeriodLabel?: string | null;
  finalPeriodLabel?: string | null;
  recoveryScorePercent?: number | null;
  note?: string;
}

export interface PerformanceComparePatient {
  patientId: number;
  fullName: string;
  temporalSeries: PerformanceCompareTemporalPoint[];
  summary: PerformanceComparePatientSummary;
}

export interface PerformanceCompareGroupBounds {
  minObserved: number;
  maxObserved: number;
  minMeta: number;
  maxMeta: number;
}

export interface PerformanceCompareApiResponse {
  patients: PerformanceComparePatient[];
  groupBounds: PerformanceCompareGroupBounds;
}

export interface PerformanceCompareRequestBody {
  patientIds: number[];
}
