import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiConfigService } from '../../core/api-config.service';
import type { ClinicalExportApiRequestDto } from '../data/clinical-export-request.dto';

function defaultExportFilename(body: ClinicalExportApiRequestDto): string {
  const ext = body.format === 'pdf' ? 'pdf' : 'xlsx';
  return `informe_clinico_${body.patientId}_${body.dateFrom}_${body.dateTo}.${ext}`;
}

/** Extrae nombre de archivo de `Content-Disposition` (RFC 5987 y forma simple). */
function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const utf8 = /filename\*=UTF-8''([^;\s]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) {
    return quoted[1];
  }
  const plain = /filename=([^;\s]+)/i.exec(header);
  if (plain?.[1]) {
    return plain[1].replace(/^["']|["']$/g, '');
  }
  return null;
}

function mapBlobHttpError(err: HttpErrorResponse): Observable<never> {
  if (err.error instanceof Blob) {
    return from(err.error.text()).pipe(
      switchMap((text) => {
        let detail = `No se pudo exportar (HTTP ${err.status}).`;
        try {
          const j = JSON.parse(text) as { detail?: unknown };
          if (typeof j.detail === 'string') {
            detail = j.detail;
          } else if (j.detail && typeof j.detail === 'object') {
            detail = JSON.stringify(j.detail);
          }
        } catch {
          if (text?.trim()) {
            detail = text.trim().slice(0, 200);
          }
        }
        return throwError(() => new Error(detail));
      }),
    );
  }
  return throwError(() => new Error(`No se pudo exportar (HTTP ${err.status}).`));
}

@Injectable({ providedIn: 'root' })
export class ClinicalExportApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  /**
   * `POST /api/v1/reports/export/` — respuesta binaria; el interceptor añade `Authorization: Token …`.
   */
  requestExport(body: ClinicalExportApiRequestDto): Observable<{ blob: Blob; filename: string }> {
    return this.http
      .post(this.api.url('/reports/export/'), body, {
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        switchMap((resp: HttpResponse<Blob>) => {
          const blob = resp.body;
          if (!blob || blob.size === 0) {
            return throwError(() => new Error('El servidor devolvió un archivo vacío.'));
          }
          const name =
            parseContentDispositionFilename(resp.headers.get('Content-Disposition')) ??
            defaultExportFilename(body);
          return of({ blob, filename: name });
        }),
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            return mapBlobHttpError(err);
          }
          return throwError(() => (err instanceof Error ? err : new Error('Error al exportar.')));
        }),
      );
  }
}
