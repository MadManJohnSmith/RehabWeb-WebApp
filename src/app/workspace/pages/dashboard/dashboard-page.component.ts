import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

type InactivityPatient = { name: string; days: number; condition: string; initials: string };
type RingMetric = { label: string; value: string; frac: number };
type SessionRow = { date: string; exercise: string; score: number };

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, UiIconComponent],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  private readonly toast = inject(ToastService);

  readonly inactivityHeadline = 'Alerta de Inactividad de Pacientes';
  readonly inactivityCount = 2;
  readonly inactivityPatients: InactivityPatient[] = [
    { name: 'James Thornton', days: 7, condition: 'Hombro postoperatorio', initials: 'JT' },
    { name: 'María Santos', days: 5, condition: 'Rodilla — ACL', initials: 'MS' },
  ];

  readonly ringMetrics: RingMetric[] = [
    { label: 'Cumplimiento', value: '88%', frac: 0.88 },
    { label: 'Días activos', value: '12', frac: 0.72 },
    { label: 'Duración', value: '41 min', frac: 0.81 },
    { label: 'Dolor (VAS)', value: '3.2', frac: 0.64 },
  ];

  readonly lineMeta = [56, 57, 58, 59, 60, 61, 62, 63];
  readonly lineReal = [58, 60, 55, 62, 64, 61, 68, 72];

  protected readonly chartTooltip = signal<{ x: number; y: number; label: string } | null>(null);

  readonly recentSessions: SessionRow[] = [
    { date: '2026-04-15', exercise: 'Flexión hombro asistida', score: 88 },
    { date: '2026-04-15', exercise: 'Estabilización monopodal', score: 81 },
    { date: '2026-04-14', exercise: 'Movilidad tobillo', score: 76 },
    { date: '2026-04-14', exercise: 'Core — plancha lateral', score: 84 },
    { date: '2026-04-13', exercise: 'Rodilla — extensión controlada', score: 79 },
  ];

  readonly reviewToday = ['James Thornton', 'María Santos', 'Lucía Fernández'];

  readonly reportSnippets = [
    { title: 'Informe semanal cohorte A', date: '2026-04-14' },
    { title: 'Comparativa ROM — hombro', date: '2026-04-12' },
  ];

  protected readonly chartDots = computed(() =>
    this.dotsFromSeries(this.lineMeta, this.lineReal, 420, 200, 20),
  );

  readonly ringCirc = 2 * Math.PI * 38;

  showPointTip(ev: MouseEvent, label: string): void {
    const svg = (ev.currentTarget as SVGElement).closest('svg');
    const rect = svg?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    this.chartTooltip.set({
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top - 10,
      label,
    });
  }

  clearTip(): void {
    this.chartTooltip.set(null);
  }

  linePointsFor(values: number[], width = 420, height = 200, pad = 20): string {
    const all = [...this.lineMeta, ...this.lineReal];
    const n = values.length;
    if (n < 2) {
      return '';
    }
    const min = Math.min(...all) - 4;
    const max = Math.max(...all) + 4;
    const span = max - min || 1;
    return values
      .map((v, i) => {
        const x = pad + (i / (n - 1)) * (width - pad * 2);
        const y = height - pad - ((v - min) / span) * (height - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  openReportSnippet(title: string): void {
    this.toast.show(`Resumen «${title}»: la descarga se enlazará al módulo de reportes en el servidor.`);
  }

  private dotsFromSeries(
    meta: number[],
    real: number[],
    width: number,
    height: number,
    pad: number,
  ): { cx: number; cy: number; meta: number; real: number; regression: boolean }[] {
    const combined = [...meta, ...real];
    const n = real.length;
    if (n < 2) {
      return [];
    }
    const min = Math.min(...combined) - 4;
    const max = Math.max(...combined) + 4;
    const span = max - min || 1;
    return real.map((v, i) => {
      const x = pad + (i / (n - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      const m = meta[i] ?? v;
      return { cx: x, cy: y, meta: m, real: v, regression: v < m };
    });
  }
}
