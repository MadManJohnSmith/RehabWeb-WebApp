import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/api-config.service';
import type {
  PaginatedTherapistPatientsDto,
  PatientLinkRequestDto,
  TherapistPatientRowDto,
} from '../data/patients-api.types';

@Injectable({ providedIn: 'root' })
export class PatientsApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiConfigService);

  /**
   * `GET /api/v1/patients/` — lista paginada de vínculos del terapeuta.
   * Por defecto incluye desvinculados para el mismo listado atenuado que la UI previa.
   */
  list(params: {
    q?: string;
    clinicalStatus?: string;
    includeDeleted?: boolean;
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Observable<PaginatedTherapistPatientsDto> {
    let hp = new HttpParams();
    if (params.q?.trim()) {
      hp = hp.set('q', params.q.trim());
    }
    if (params.clinicalStatus?.trim()) {
      hp = hp.set('clinicalStatus', params.clinicalStatus.trim());
    }
    if (params.includeDeleted !== false) {
      hp = hp.set('includeDeleted', 'true');
    }
    if (params.page != null) {
      hp = hp.set('page', String(params.page));
    }
    if (params.page_size != null) {
      hp = hp.set('page_size', String(params.page_size));
    }
    if (params.ordering) {
      hp = hp.set('ordering', params.ordering);
    }
    return this.http.get<PaginatedTherapistPatientsDto>(this.api.url('/patients/'), { params: hp });
  }

  /** `GET /api/v1/patients/<pk>/` — ficha (vínculo preferente). */
  getFicha(patientId: number): Observable<TherapistPatientRowDto> {
    return this.http.get<TherapistPatientRowDto>(this.api.url(`/patients/${patientId}/`));
  }

  /** `POST /api/v1/patients/link/` */
  link(body: PatientLinkRequestDto): Observable<TherapistPatientRowDto> {
    return this.http.post<TherapistPatientRowDto>(this.api.url('/patients/link/'), body);
  }

  /** `PATCH /api/v1/therapist-patients/<linkId>/` */
  patchLink(
    linkId: number,
    body: { primaryDiagnosis?: string; clinicalStatus?: 'riesgo' | 'activo' | 'alta' },
  ): Observable<TherapistPatientRowDto> {
    return this.http.patch<TherapistPatientRowDto>(this.api.url(`/therapist-patients/${linkId}/`), body);
  }

  /** `POST /api/v1/therapist-patients/<linkId>/unlink/` */
  unlink(linkId: number): Observable<TherapistPatientRowDto> {
    return this.http.post<TherapistPatientRowDto>(
      this.api.url(`/therapist-patients/${linkId}/unlink/`),
      {},
    );
  }

  /** `POST /api/v1/therapist-patients/<linkId>/restore/` */
  restore(linkId: number): Observable<TherapistPatientRowDto> {
    return this.http.post<TherapistPatientRowDto>(
      this.api.url(`/therapist-patients/${linkId}/restore/`),
      {},
    );
  }
}
