/** Ejercicio en detalle de sesión (API). */
export interface SessionApiExerciseDto {
  id: number;
  name: string;
  sets: number | null;
  reps: number | null;
  notes: string;
  sortOrder: number;
}

/** Fila de listado `SessionListSerializer`. */
export interface SessionApiListRowDto {
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

export interface SessionApiDetailDto extends SessionApiListRowDto {
  notes: string;
  exercises: SessionApiExerciseDto[];
}

export interface PaginatedSessionsDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: SessionApiListRowDto[];
}
