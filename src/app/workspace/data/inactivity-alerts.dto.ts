export type InactivityAlertPriority = 'alta' | 'media';

/** Fila de alerta para la tabla (HU-03): datos del API o mock de respaldo). */
export interface InactivityAlertRowDto {
  alertId: string;
  /** PK de paciente en el API; ruta `/app/pacientes/:id`. */
  patientId: number;
  patientName: string;
  /**
   * Días desde la última sesión; `null` si no hay sesiones (inactivo por regla del servidor).
   * Umbral de inactividad: ver {@link InactivityAlertsViewDto.thresholdDays}.
   */
  daysSinceActivity: number | null;
  priority: InactivityAlertPriority;
}

/** Vista de la página: respuesta de `GET /api/v1/inactivity-alerts/` mapeada a filas de tabla. */
export interface InactivityAlertsViewDto {
  thresholdDays: number;
  inactiveCount: number;
  alerts: InactivityAlertRowDto[];
}
