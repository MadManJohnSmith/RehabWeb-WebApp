import type { DashboardMetricsDto, TemporalMetricPointDto } from './dashboard-metrics.dto';

const temporalSeries: TemporalMetricPointDto[] = [
  { weekIndex: 0, weekLabel: 'Sem 1', metaValue: 56, observedValue: 58 },
  { weekIndex: 1, weekLabel: 'Sem 2', metaValue: 57, observedValue: 60 },
  { weekIndex: 2, weekLabel: 'Sem 3', metaValue: 58, observedValue: 55 },
  { weekIndex: 3, weekLabel: 'Sem 4', metaValue: 59, observedValue: 62 },
  { weekIndex: 4, weekLabel: 'Sem 5', metaValue: 60, observedValue: 64 },
  { weekIndex: 5, weekLabel: 'Sem 6', metaValue: 61, observedValue: 61 },
  { weekIndex: 6, weekLabel: 'Sem 7', metaValue: 62, observedValue: 68 },
  { weekIndex: 7, weekLabel: 'Sem 8', metaValue: 63, observedValue: 72 },
];

/** Dataset acotado (≤14 puntos por serie) para demo y criterio de rendimiento en front. */
export const DASHBOARD_METRICS_MOCK: DashboardMetricsDto = {
  inactivityHeadline: 'Alerta de Inactividad de Pacientes',
  inactivityCount: 2,
  inactivityPatients: [
    {
      patientId: 'p-001',
      name: 'James Thornton',
      days: 7,
      condition: 'Hombro postoperatorio',
      initials: 'JT',
    },
    { patientId: 'p-002', name: 'María Santos', days: 5, condition: 'Rodilla — ACL', initials: 'MS' },
  ],
  ringMetrics: [
    { label: 'Cumplimiento', value: '88%', frac: 0.88 },
    { label: 'Días activos', value: '12', frac: 0.72 },
    { label: 'Duración', value: '41 min', frac: 0.81 },
    { label: 'Dolor (VAS)', value: '3.2', frac: 0.64 },
  ],
  temporalSeries,
  romByWeek: [
    { weekLabel: 'S1', romDegrees: 38 },
    { weekLabel: 'S2', romDegrees: 42 },
    { weekLabel: 'S3', romDegrees: 40 },
    { weekLabel: 'S4', romDegrees: 48 },
    { weekLabel: 'S5', romDegrees: 52 },
    { weekLabel: 'S6', romDegrees: 55 },
    { weekLabel: 'S7', romDegrees: 58 },
    { weekLabel: 'S8', romDegrees: 62 },
  ],
  recentSessions: [
    { date: '2026-04-15', exercise: 'Flexión hombro asistida', score: 88 },
    { date: '2026-04-15', exercise: 'Estabilización monopodal', score: 81 },
    { date: '2026-04-14', exercise: 'Movilidad tobillo', score: 76 },
    { date: '2026-04-14', exercise: 'Core — plancha lateral', score: 84 },
    { date: '2026-04-13', exercise: 'Rodilla — extensión controlada', score: 79 },
  ],
  reviewToday: ['James Thornton', 'María Santos', 'Lucía Fernández'],
  reportSnippets: [
    { title: 'Informe semanal cohorte A', date: '2026-04-14', patientId: 1, patientName: 'James Thornton', sessionId: 101, occurredAt: '2026-04-14T10:00:00Z' },
    { title: 'Comparativa ROM — hombro', date: '2026-04-12', patientId: 2, patientName: 'María Santos', sessionId: 102, occurredAt: '2026-04-12T15:30:00Z' },
  ],
};
