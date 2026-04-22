import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { DASHBOARD_METRICS_MOCK } from '../../data/dashboard-metrics.mock';
import type { TemporalMetricPointDto } from '../../data/dashboard-metrics.dto';
import { DashboardDataService } from '../../services/dashboard-data.service';

type ChartDotTrend = 'start' | 'improved' | 'regressed' | 'flat';

type ChartDot = {
  cx: number;
  cy: number;
  trend: ChartDotTrend;
  tip: string;
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, UiIconComponent],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  private readonly toast = inject(ToastService);
  private readonly dashboardData = inject(DashboardDataService);

  /** Tooltip / aria: AC HU-03 (Cron es backend). */
  readonly inactivityCronHint =
    'En producción: un Cron en el servidor revisa cada día las últimas sesiones y marca inactividad cuando pasan más de 3 días sin registro.';

  /** Vista reactiva del mock tipo respuesta API (misma referencia hasta primer tick). */
  readonly vm = toSignal(this.dashboardData.getDashboardMetrics(), {
    initialValue: DASHBOARD_METRICS_MOCK,
  });

  protected readonly chartTooltip = signal<{ x: number; y: number; label: string } | null>(null);

  readonly ringCirc = 2 * Math.PI * 38;

  private readonly boundsValues = computed(() => {
    const s = this.vm().temporalSeries;
    return s.flatMap((p) => [p.metaValue, p.observedValue]);
  });

  readonly lineMetaPoints = computed(() =>
    this.linePointsFor(
      this.vm().temporalSeries.map((p) => p.metaValue),
      this.boundsValues(),
    ),
  );

  readonly lineRealPoints = computed(() =>
    this.linePointsFor(
      this.vm().temporalSeries.map((p) => p.observedValue),
      this.boundsValues(),
    ),
  );

  readonly chartDots = computed(() =>
    this.dotsNvNMinus1(this.vm().temporalSeries, 420, 200, 20),
  );

  readonly romMaxDegrees = computed(() =>
    Math.max(1, ...this.vm().romByWeek.map((r) => r.romDegrees)),
  );

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

  openReportSnippet(title: string): void {
    this.toast.show(`Resumen «${title}»: la descarga se enlazará al módulo de reportes en el servidor.`);
  }

  private linePointsFor(
    values: number[],
    combinedForBounds: number[],
    width = 420,
    height = 200,
    pad = 20,
  ): string {
    const n = values.length;
    if (n < 2) {
      return '';
    }
    const min = Math.min(...combinedForBounds) - 4;
    const max = Math.max(...combinedForBounds) + 4;
    const span = max - min || 1;
    return values
      .map((v, i) => {
        const x = pad + (i / (n - 1)) * (width - pad * 2);
        const y = height - pad - ((v - min) / span) * (height - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  private dotsNvNMinus1(
    series: TemporalMetricPointDto[],
    width: number,
    height: number,
    pad: number,
  ): ChartDot[] {
    const observed = series.map((p) => p.observedValue);
    const combined = series.flatMap((p) => [p.metaValue, p.observedValue]);
    const n = observed.length;
    if (n < 2) {
      return [];
    }
    const min = Math.min(...combined) - 4;
    const max = Math.max(...combined) + 4;
    const span = max - min || 1;

    return observed.map((v, i) => {
      const x = pad + (i / (n - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      const prev = i === 0 ? null : observed[i - 1];
      let trend: ChartDotTrend;
      if (i === 0) {
        trend = 'start';
      } else if (prev !== null && v > prev) {
        trend = 'improved';
      } else if (prev !== null && v < prev) {
        trend = 'regressed';
      } else {
        trend = 'flat';
      }

      const wk = series[i]?.weekLabel ?? `Sem ${i + 1}`;
      const meta = series[i]?.metaValue ?? v;
      const trendEs =
        trend === 'start'
          ? 'sin periodo previo'
          : trend === 'improved'
            ? 'mejora vs periodo anterior'
            : trend === 'regressed'
              ? 'regresión vs periodo anterior'
              : 'sin cambio vs periodo anterior';

      let tip: string;
      if (prev === null) {
        tip = `${wk}: observado ${v} pts · meta ${meta} · ${trendEs}`;
      } else {
        const delta = Math.round((v - prev + Number.EPSILON) * 100) / 100;
        tip = `${wk}: observado ${v} pts · anterior ${prev} (Δ ${delta >= 0 ? '+' : ''}${delta}) · meta ${meta} · ${trendEs}`;
      }

      return { cx: x, cy: y, trend, tip };
    });
  }
}
