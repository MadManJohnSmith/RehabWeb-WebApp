/** Cuerpo JSON para `POST /api/v1/reports/export/` (camelCase, `ClinicalExportRequestSerializer` en el API). */
export interface ClinicalExportApiRequestDto {
  patientId: number;
  /** `YYYY-MM-DD` (input type="date"). */
  dateFrom: string;
  dateTo: string;
  format: 'pdf' | 'xlsx';
}

/** Alineado con `MAX_EXPORT_RANGE_DAYS` en `RehabWeb_API/services/clinical_export.py`. */
export const MAX_CLINICAL_EXPORT_RANGE_DAYS = 366;
