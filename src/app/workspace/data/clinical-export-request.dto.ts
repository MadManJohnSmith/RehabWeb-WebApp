/** Cuerpo previsto para POST/GET de exportación clínica (al conectar API real). */
export interface ClinicalExportFiltersDto {
  patientId: string;
  dateFrom: string;
  dateTo: string;
}
