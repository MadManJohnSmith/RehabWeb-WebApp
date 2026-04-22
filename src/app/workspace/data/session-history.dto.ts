export type SessionStatus = 'Excelente' | 'Bueno' | 'Regular';

export interface SessionListRowDto {
  id: string;
  date: string;
  patient: string;
  patientId: string;
  program: string;
  durationMin: number;
  score: number;
  status: SessionStatus;
}

export interface SessionDetailDto extends SessionListRowDto {
  therapistNotes: string;
  exercises: { name: string; setsReps: string; notes: string }[];
  adherencePct: number;
}
