import type { InactivityAlertApiItem, InactivityAlertsApiResponse } from './inactivity-alerts-api.types';
import { mapInactivityApiItemToRow, mapInactivityApiResponseToView } from './inactivity-alerts.mapper';

describe('inactivity-alerts.mapper', () => {
  it('mapInactivityApiItemToRow maps fields and alta when no sessions', () => {
    const row: InactivityAlertApiItem = {
      patientId: 12,
      fullName: 'Test User',
      daysSinceLastSession: null,
      lastSessionAt: null,
    };
    const dto = mapInactivityApiItemToRow(row);
    expect(dto.alertId).toBe('inact-12');
    expect(dto.patientId).toBe(12);
    expect(dto.patientName).toBe('Test User');
    expect(dto.daysSinceActivity).toBeNull();
    expect(dto.priority).toBe('alta');
  });

  it('mapInactivityApiItemToRow uses media for 4–6 days and alta for 7+', () => {
    expect(mapInactivityApiItemToRow(makeItem(5)).priority).toBe('media');
    expect(mapInactivityApiItemToRow(makeItem(7)).priority).toBe('alta');
  });

  it('mapInactivityApiResponseToView passes through counts and maps alerts', () => {
    const res: InactivityAlertsApiResponse = {
      thresholdDays: 3,
      inactiveCount: 2,
      alerts: [makeItem(1), makeItem(2)],
    };
    const vm = mapInactivityApiResponseToView(res);
    expect(vm.thresholdDays).toBe(3);
    expect(vm.inactiveCount).toBe(2);
    expect(vm.alerts.length).toBe(2);
    expect(vm.alerts[0].patientId).toBe(1);
  });
});

function makeItem(days: number | null): InactivityAlertApiItem {
  return {
    patientId: 99,
    fullName: 'X',
    daysSinceLastSession: days,
    lastSessionAt: null,
  };
}
