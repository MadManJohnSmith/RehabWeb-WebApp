import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import type { SessionDetailDto, SessionListRowDto } from '../data/session-history.dto';
import { SESSION_LIST_MOCK } from '../data/sessions-list.mock';

type SessionHistoryJsonFile = {
  details: Partial<Record<string, SessionDetailDto>>;
};

@Injectable({ providedIn: 'root' })
export class SessionHistoryApiService {
  private readonly http = inject(HttpClient);

  /**
   * Simula listado paginado (filtro en cliente + latencia).
   * Cumple AC-01 de HU-05 con orden ya garantizado en el mock.
   */
  searchSessions(params: {
    q: string;
    page: number;
    pageSize: number;
    patientId?: string;
  }): Observable<{ rows: SessionListRowDto[]; total: number }> {
    return timer(130).pipe(
      map(() => {
        const q = params.q.trim().toLowerCase();
        let rows = SESSION_LIST_MOCK.filter((r) => {
          const byText =
            !q ||
            r.id.toLowerCase().includes(q) ||
            r.patient.toLowerCase().includes(q) ||
            r.program.toLowerCase().includes(q) ||
            r.patientId.toLowerCase().includes(q);
          const byPatient = !params.patientId || r.patientId === params.patientId;
          return byText && byPatient;
        });
        const total = rows.length;
        const start = (params.page - 1) * params.pageSize;
        return { rows: rows.slice(start, start + params.pageSize), total };
      }),
    );
  }

  /**
   * Simula GET de detalle (AJAX / HttpClient) con JSON estático + latencia.
   * Sesiones sin entrada explícita en el JSON usan detalle sintético a partir de la fila del mock.
   */
  getSessionDetail(sessionId: string): Observable<SessionDetailDto> {
    return this.http.get<SessionHistoryJsonFile>('/mock/session-history.json').pipe(
      delay(280),
      map((payload) => {
        const fromFile = payload.details[sessionId];
        if (fromFile) {
          return fromFile;
        }
        const row = SESSION_LIST_MOCK.find((r) => r.id === sessionId);
        return this.fallbackDetail(row, sessionId);
      }),
    );
  }

  private fallbackDetail(row: SessionListRowDto | undefined, sessionId: string): SessionDetailDto {
    if (!row) {
      return {
        id: sessionId,
        date: '—',
        patient: '—',
        patientId: '',
        program: '—',
        durationMin: 0,
        score: 0,
        status: 'Regular',
        therapistNotes: 'No hay fila de listado para este ID en la demo.',
        exercises: [],
        adherencePct: 0,
      };
    }
    return {
      ...row,
      therapistNotes:
        'Detalle generado en cliente: esta sesión no tiene ampliación en `mock/session-history.json` (demo HU-05).',
      exercises: [
        {
          name: row.program,
          setsReps: 'Ver plan',
          notes: 'Resumen único derivado del programa de la sesión (mock).',
        },
      ],
      adherencePct: Math.min(100, Math.max(0, row.score)),
    };
  }
}
