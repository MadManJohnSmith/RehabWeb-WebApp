import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import type { DashboardMetricsDto, TemporalMetricPointDto, ReportSnippetDto } from '../../data/dashboard-metrics.dto';
import { calculateExportDateRange } from '../../data/export-date-range.util';
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
export class DashboardPageComponent implements AfterViewInit {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly dashboardData = inject(DashboardDataService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly inactivityCronHint =
    'En producción: un Cron en el servidor revisa cada día las últimas sesiones y marca inactividad cuando pasan más de 3 días sin registro.';

  private readonly emptyDashboard: DashboardMetricsDto = {
    inactivityHeadline: '',
    inactivityCount: 0,
    inactivityPatients: [],
    ringMetrics: [],
    temporalSeries: [],
    romByWeek: [],
    recentSessions: [],
    reviewToday: [],
    reportSnippets: []
  };

  readonly loadState = signal<'loading' | 'ok' | 'error'>('loading');
  readonly loadError = signal<string | null>(null);
  readonly vm = signal<DashboardMetricsDto>(this.emptyDashboard);

  protected readonly chartTooltip = signal<{ x: number; y: number; label: string } | null>(null);

  readonly ringCirc = 2 * Math.PI * 38;

  readonly usingFallback = computed(() => this.loadState() === 'error');

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

  readonly chartDots = computed(() => this.dotsNvNMinus1(this.vm().temporalSeries, 560, 240, 24));

  readonly romMaxDegrees = computed(() =>
    Math.max(1, ...this.vm().romByWeek.map((r) => r.romDegrees)),
  );

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    requestAnimationFrame(() => this.loadDashboard());
  }

  loadDashboard(): void {
    this.loadState.set('loading');
    this.loadError.set(null);
    this.dashboardData.getDashboardMetrics().subscribe({
      next: (data) => {
        this.vm.set(data);
        this.cd.detectChanges();
        requestAnimationFrame(() => {});
        this.loadState.set('ok');
      },
      error: () => {
        this.vm.set(this.emptyDashboard);
        this.cd.detectChanges();
        requestAnimationFrame(() => {});
        this.loadState.set('error');
        this.loadError.set(
          'No se pudo cargar el tablero desde el API. Comprueba que el backend esté en marcha y que hayas iniciado sesión.',
        );
      },
    });
  }

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

  openReportSnippet(snippet: ReportSnippetDto): void {
    if (!snippet.patientId) {
      this.toast.show(`El resumen «${snippet.title}» no tiene datos de paciente para exportar.`);
      return;
    }
    
    this.toast.show(`Abriendo exportación para ${snippet.patientName}...`);
    
    const { dateFrom, dateTo } = calculateExportDateRange(snippet.occurredAt);
    
    this.router.navigate(['/app/reportes'], {
      queryParams: {
        patientId: snippet.patientId,
        dateFrom,
        dateTo
      }
    });
  }

  romBarHeightPx(romDegrees: number): number {
    return Math.max(12, (romDegrees / this.romMaxDegrees()) * 96);
  }

  private linePointsFor(
    values: number[],
    combinedForBounds: number[],
    width = 560,
    height = 240,
    pad = 24,
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
