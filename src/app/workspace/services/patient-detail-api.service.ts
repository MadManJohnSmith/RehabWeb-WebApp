import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiConfigService } from '../../core/api-config.service';
export type PatientDetailRecord = {
  id: string;
  name: string;
  condition: string;
  recoveryScore: number;
  vasPain: number;
  status: string;
  meta: number[];
  real: number[];
  joints: { label: string; score: number }[];
  api?: {
    clinicalStatus: string;
    lastSessionAt: string | null;
    isUnlinked?: boolean;
    deletedAt?: string | null;
    linkId: number;
    associationId: string;
  };
};

export interface ApiPatientFicha {
  patientId: number;
  linkId: number;
  associationId: string;
  fullName: string;
  primaryDiagnosis: string;
  clinicalStatus: string;
  lastSessionAt: string | null;
}

export interface ApiPerformanceSeries {
  patientId: number;
  fullName: string;
  temporalSeries: Array<{
    sortOrder: number;
    periodLabel: string;
    metaValue: number;
    observedValue: number;
    trend: string;
  }>;
  summary: {
    initialMeta: number;
    initialObserved: number;
    finalMeta: number;
    finalObserved: number;
    recoveryScorePercent: number | null;
  };
}

export interface ApiSessionListResponse {
  results: Array<{
    id: number;
    patientId: number;
    patientName: string;
    occurredAt: string;
    programLabel: string;
    durationMin: number | null;
    score: number | null;
    status: string;
    adherencePercent: number | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class PatientDetailApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  getPatientDetail(patientId: number): Observable<{ profile: PatientDetailRecord, sessions: any[] }> {
    const profile$ = this.http.get<ApiPatientFicha>(this.api.url(`/patients/${patientId}/`));
    const performance$ = this.http.get<ApiPerformanceSeries>(this.api.url(`/patients/${patientId}/performance-series/`));
    const sessions$ = this.http.get<ApiSessionListResponse>(this.api.url(`/sessions/?patientId=${patientId}`));

    return forkJoin({
      profile: profile$,
      performance: performance$,
      sessions: sessions$,
    }).pipe(
      map(({ profile, performance, sessions }) => {
        // Map to the format expected by the frontend
        
        const mappedProfile: PatientDetailRecord = {
          id: `p-${profile.patientId}`, // The UI expects string IDs like 'p-001' sometimes, but we can just use the number string
          name: profile.fullName,
          condition: profile.primaryDiagnosis || 'Sin diagnóstico',
          recoveryScore: Math.round(performance.summary.recoveryScorePercent ?? 0),
          vasPain: 5, // Static fallback as agreed
          status: profile.clinicalStatus,
          meta: performance.temporalSeries.map(s => s.metaValue),
          real: performance.temporalSeries.map(s => s.observedValue),
          joints: [
            { label: 'Movilidad articular (Placeholder)', score: 75 },
            { label: 'Fuerza (Placeholder)', score: 60 },
          ], // Static fallback as agreed
          api: {
            clinicalStatus: profile.clinicalStatus,
            lastSessionAt: profile.lastSessionAt,
            linkId: profile.linkId,
            associationId: profile.associationId
          }
        };

        // Map sessions
        const mappedSessions = sessions.results.map(s => ({
          id: `s-${s.id}`,
          patientId: `p-${s.patientId}`,
          patient: s.patientName,
          date: s.occurredAt.split('T')[0],
          program: s.programLabel,
          duration: s.durationMin || 0,
          score: s.score || 0,
          status: s.status === 'completada' ? 'completed' : s.status === 'parcial' ? 'partial' : 'skipped',
          adherence: s.adherencePercent || 0,
        }));

        return {
          profile: mappedProfile,
          sessions: mappedSessions
        };
      })
    );
  }
}
