import type {
  DashboardMetricsDto,
  InactivityPatientDto,
  ReportSnippetDto,
  RingMetricDto,
  RomWeeklyPointDto,
  SessionRowDto,
  TemporalMetricPointDto,
} from './dashboard-metrics.dto';
import type {
  DashboardApiInactivityPatient,
  DashboardApiMetricRow,
  DashboardApiPayload,
  DashboardApiRecentSession,
  DashboardApiSummaryRing,
} from './dashboard-api.types';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? '';
    const b = parts[parts.length - 1]?.[0] ?? '';
    return `${a}${b}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || '—';
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso.slice(0, 10);
  }
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

function mapInactivityPatients(rows: DashboardApiInactivityPatient[]): InactivityPatientDto[] {
  return rows.map((p) => ({
    patientId: String(p.patientId),
    name: p.fullName,
    days: p.daysSinceLastSession ?? 0,
    condition: '—',
    initials: initialsFromName(p.fullName),
  }));
}

function mapTemporalSeries(rows: DashboardApiMetricRow[]): TemporalMetricPointDto[] {
  return rows.map((row, i) => ({
    weekIndex: i,
    weekLabel: row.periodLabel?.trim() || `P${i + 1}`,
    metaValue: row.metaValue ?? 0,
    observedValue: row.observedValue ?? 0,
  }));
}

function mapRomByWeek(rows: DashboardApiMetricRow[]): RomWeeklyPointDto[] {
  return rows.map((row) => ({
    weekLabel: row.periodLabel?.trim() || '—',
    romDegrees: Math.round(row.observedValue ?? row.metaValue ?? 0),
  }));
}

function mapSummaryRings(rings: DashboardApiSummaryRing[]): RingMetricDto[] {
  const out: RingMetricDto[] = (rings ?? []).map((r) => {
    const max = r.maxValue > 0 ? r.maxValue : 1;
    const frac = Math.min(1, Math.max(0, Number(r.value) / max));
    let valueStr = String(r.value);
    if (r.unit === 'percent') {
      valueStr = `${r.value}%`;
    } else if (r.unit === 'count') {
      valueStr = String(Math.round(r.value));
    }
    return { label: r.label, value: valueStr, frac };
  });
  if (!out.length) {
    return [{ label: 'Sin indicadores', value: '—', frac: 0 }];
  }
  return out;
}

function mapRecentSessions(rows: DashboardApiRecentSession[]): SessionRowDto[] {
  return (rows ?? []).map((s) => ({
    date: formatDateShort(s.occurredAt),
    exercise: s.programLabel?.trim() || 'Sesión',
    score: s.score != null ? Math.round(Number(s.score)) : 0,
  }));
}

function buildReviewToday(
  inactive: InactivityPatientDto[],
  recent: DashboardApiRecentSession[],
): string[] {
  const names = [...new Set(inactive.map((p) => p.name))];
  if (names.length >= 3) {
    return names.slice(0, 8);
  }
  const extra = [...new Set((recent ?? []).map((x) => x.patientName))].filter((n) => !names.includes(n));
  return [...names, ...extra].slice(0, 8);
}

function buildReportSnippets(recent: DashboardApiRecentSession[]): ReportSnippetDto[] {
  return (recent ?? []).slice(0, 4).map((s) => ({
    title: s.programLabel?.trim() || `Sesión #${s.id}`,
    date: formatDateShort(s.occurredAt),
    patientId: s.patientId,
    patientName: s.patientName,
    sessionId: s.id,
    occurredAt: s.occurredAt,
  }));
}

/**
 * Convierte el JSON del backend al `DashboardMetricsDto` que consume la plantilla Angular.
 */
export function mapDashboardApiToDto(api: DashboardApiPayload): DashboardMetricsDto {
  const summary = api.inactivitySummary ?? { inactiveCount: 0, thresholdDays: 3, patients: [] };
  const inactiveCount = summary.inactiveCount ?? summary.patients?.length ?? 0;
  const inactivityPatients = mapInactivityPatients(summary.patients ?? []);

  const temporalSeries = mapTemporalSeries(api.temporalSeries ?? []);
  const romByWeek = mapRomByWeek(api.romByWeek ?? []);
  const ringMetrics = mapSummaryRings(api.summaryRings ?? []);
  const recentSessions = mapRecentSessions(api.recentSessions ?? []);

  const headline =
    api.therapistLinked === false
      ? 'Perfil de terapeuta no vinculado'
      : 'Alerta de Inactividad de Pacientes';

  return {
    inactivityHeadline: headline,
    inactivityCount: inactiveCount,
    inactivityPatients,
    ringMetrics,
    temporalSeries:
      temporalSeries.length > 0
        ? temporalSeries
        : [
            { weekIndex: 0, weekLabel: '—', metaValue: 0, observedValue: 0 },
            { weekIndex: 1, weekLabel: '—', metaValue: 0, observedValue: 0 },
          ],
    romByWeek: romByWeek.length > 0 ? romByWeek : [],
    recentSessions,
    reviewToday: buildReviewToday(inactivityPatients, api.recentSessions ?? []),
    reportSnippets: buildReportSnippets(api.recentSessions ?? []),
  };
}
