export type InactivityAlertPriority = 'alta' | 'media';

/** Fila de alerta simulada (lista de seguimiento por inactividad). */
export interface InactivityAlertRowDto {
  alertId: string;
  patientId: string;
  patientName: string;
  /** Días desde la última sesión; en mock siempre estrictamente > 3 (criterio HU-03). */
  daysSinceActivity: number;
  priority: InactivityAlertPriority;
}
