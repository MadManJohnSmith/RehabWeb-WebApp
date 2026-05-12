/** Fila de vínculo terapeuta–paciente (`TherapistPatientRowSerializer`). */
export interface TherapistPatientRowDto {
  patientId: number;
  linkId: number;
  associationId: string;
  fullName: string;
  primaryDiagnosis: string;
  clinicalStatus: 'riesgo' | 'activo' | 'alta';
  lastSessionAt: string | null;
  deletedAt: string | null;
  isUnlinked: boolean;
}

export interface PaginatedTherapistPatientsDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: TherapistPatientRowDto[];
}

export interface PatientLinkRequestDto {
  associationId?: string;
  fullName: string;
  primaryDiagnosis?: string;
  clinicalStatus?: 'riesgo' | 'activo' | 'alta';
}
