import type { DashboardApiPayload } from './dashboard-api.types';
import { mapDashboardApiToDto } from './dashboard-metrics.mapper';

describe('dashboard-metrics.mapper', () => {
  it('mapDashboardApiToDto maps inactivity summary and temporal series', () => {
    const api = buildMinimalPayload();
    const dto = mapDashboardApiToDto(api);
    expect(dto.inactivityCount).toBe(1);
    expect(dto.inactivityPatients.length).toBe(1);
    expect(dto.inactivityPatients[0].patientId).toBe('7');
    expect(dto.inactivityPatients[0].name).toBe('Ana Prueba');
    expect(dto.temporalSeries.length).toBeGreaterThanOrEqual(1);
    expect(dto.temporalSeries[0].weekLabel).toBe('Sem 1');
    expect(dto.temporalSeries[0].metaValue).toBe(60);
    expect(dto.temporalSeries[0].observedValue).toBe(55);
  });

  it('mapDashboardApiToDto uses unlinked headline when therapistLinked is false', () => {
    const api = buildMinimalPayload();
    api.therapistLinked = false;
    const dto = mapDashboardApiToDto(api);
    expect(dto.inactivityHeadline).toContain('no vinculado');
  });

  it('mapDashboardApiToDto pads empty temporal series with two placeholder points', () => {
    const api = buildMinimalPayload();
    api.temporalSeries = [];
    const dto = mapDashboardApiToDto(api);
    expect(dto.temporalSeries.length).toBe(2);
    expect(dto.temporalSeries[0].weekLabel).toBe('—');
  });
});

function buildMinimalPayload(): DashboardApiPayload {
  return {
    therapistLinked: true,
    inactivitySummary: {
      inactiveCount: 1,
      thresholdDays: 3,
      patients: [
        {
          patientId: 7,
          fullName: 'Ana Prueba',
          daysSinceLastSession: 5,
          lastSessionAt: '2026-01-15T12:00:00Z',
        },
      ],
    },
    romByWeek: [{ sortOrder: 0, periodLabel: 'S1', metaValue: 40, observedValue: 38, trend: 'initial' }],
    temporalSeries: [{ sortOrder: 0, periodLabel: 'Sem 1', metaValue: 60, observedValue: 55, trend: 'initial' }],
    recentSessions: [],
    summaryRings: [{ key: 'k', label: 'Actividad', value: 3, maxValue: 10, unit: 'count' }],
  };
}
