import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import type { SessionDetailDto, SessionListRowDto, SessionStatus } from '../data/session-history.dto';
import type { PaginatedSessionsDto, SessionApiDetailDto, SessionApiListRowDto } from '../data/sessions-api.types';
import { ApiConfigService } from '../../core/api-config.service';

function mapSessionStatus(raw: string | null | undefined): SessionStatus {
  const t = (raw ?? '').trim().toLowerCase();
  if (t.includes('excel')) {
    return 'Excelente';
  }
  if (t.includes('bueno') || t.includes('good')) {
    return 'Bueno';
  }
  return 'Regular';
}

function formatOccurredAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso.slice(0, 16);
  }
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSetsReps(sets: number | null, reps: number | null): string {
  if (sets != null && reps != null) {
    return `${sets} × ${reps}`;
  }
  if (sets != null) {
    return `${sets} series`;
  }
  if (reps != null) {
    return `${reps} repeticiones`;
  }
  return '—';
}

function mapListRow(api: SessionApiListRowDto): SessionListRowDto {
  return {
    id: String(api.id),
    date: api.occurredAt ? formatOccurredAt(api.occurredAt) : '—',
    patient: api.patientName,
    patientId: String(api.patientId),
    program: api.programLabel || '—',
    durationMin: api.durationMin ?? 0,
    score: api.score != null ? Math.round(Number(api.score)) : 0,
    status: mapSessionStatus(api.status),
  };
}

function mapDetail(api: SessionApiDetailDto): SessionDetailDto {
  const base = mapListRow(api);
  return {
    ...base,
    therapistNotes: (api.notes ?? '').trim() || '—',
    exercises: (api.exercises ?? []).map((ex) => ({
      name: ex.name,
      setsReps: formatSetsReps(ex.sets, ex.reps),
      notes: ex.notes?.trim() || '',
    })),
    adherencePct: api.adherencePercent ?? 0,
  };
}

@Injectable({ providedIn: 'root' })
export class SessionHistoryApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  /**
   * `GET /api/v1/sessions/` — paginación servidor; `search` y `patientId` según `SessionFilter`.
   */
  searchSessions(params: {
    q: string;
    page: number;
    pageSize: number;
    patientId?: string;
  }): Observable<{ rows: SessionListRowDto[]; total: number }> {
    let hp = new HttpParams()
      .set('page', String(params.page))
      .set('page_size', String(params.pageSize));
    const q = params.q.trim();
    if (q) {
      hp = hp.set('search', q);
    }
    if (params.patientId?.trim()) {
      hp = hp.set('patientId', params.patientId.trim());
    }
    return this.http.get<PaginatedSessionsDto>(this.api.url('/sessions/'), { params: hp }).pipe(
      map((res) => ({
        rows: res.results.map(mapListRow),
        total: res.count,
      })),
    );
  }

  /** `GET /api/v1/sessions/<id>/` */
  getSessionDetail(sessionId: string): Observable<SessionDetailDto> {
    const id = Number.parseInt(sessionId, 10);
    if (!Number.isFinite(id)) {
      return throwError(() => new Error('ID de sesión no válido'));
    }
    return this.http.get<SessionApiDetailDto>(this.api.url(`/sessions/${id}/`)).pipe(map(mapDetail));
  }
}
