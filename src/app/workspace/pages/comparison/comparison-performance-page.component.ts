import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast.service';
import type {
  PaginatedTherapistPatientsDto,
  TherapistPatientRowDto,
} from '../../data/patients-api.types';
import type {
  PerformanceCompareApiResponse,
  PerformanceComparePatient,
  PerformanceCompareTemporalPoint,
} from '../../data/performance-compare-api.types';
import { PatientsApiService } from '../../services/patients-api.service';
import { PerformanceCompareApiService } from '../../services/performance-compare-api.service';
import { combineLatest, concat, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

type Dot = {
  cx: number;
  cy: number;
  meta: number;
  real: number;
  regression: boolean;
  periodLabel: string;
};

type CompareState =
  | { kind: 'idle' }
  | { kind: 'nodata' }
  | { kind: 'loading' }
  | { kind: 'ok'; data: PerformanceCompareApiResponse }
  | { kind: 'error'; message: string };

const GROUP_STROKE_CLASSES = [
  'text-pm-primary',
  'text-amber-600 dark:text-amber-400',
  'text-pm-info',
  'text-pm-coral',
] as const;

/** Alineado con `MAX_COMPARE_PATIENTS` en el API (`performance_series.py`). */
const PERFORMANCE_COMPARE_MAX_PATIENTS = 12;

function httpErrorDetail(e: HttpErrorResponse): string | null {
  const er = e.error;
  if (typeof er === 'object' && er && 'detail' in er && typeof (er as { detail: unknown }).detail === 'string') {
    return (er as { detail: string }).detail;
  }
  return null;
}

@Component({
  selector: 'app-comparison-performance-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './comparison-performance-page.component.html',
})
export class ComparisonPerformancePageComponent {
  private readonly compareApi = inject(PerformanceCompareApiService);
  private readonly patientsApi = inject(PatientsApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly patientOptions = signal<{ id: string; label: string }[]>([]);
  readonly individualPatientId = signal('');
  private readonly groupPatientIds = signal<Set<string>>(new Set());
  readonly isGroupDropdownOpen = signal(false);

  readonly groupOrderedIds = computed(() => [...this.groupPatientIds()].sort((a, b) => Number(a) - Number(b)));

  // Variables para el efecto hover en la gráfica SVG grupal
  hoveredPatientId: string | null = null;
  mouseX: number = 0;
  mouseY: number = 0;

  // Manejador del evento hover sobre las líneas
  onLineHover(pid: string, event: MouseEvent) {
    this.hoveredPatientId = pid;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  // Limpieza del estado al salir del área de la gráfica
  clearLineHover() {
    this.hoveredPatientId = null;
  }

  toggleGroupDropdown(): void {
    this.isGroupDropdownOpen.update((v) => !v);
  }

  readonly compareResult = toSignal(
    combineLatest([toObservable(this.individualPatientId), toObservable(this.groupPatientIds)]).pipe(
      map(() => this.computeQueryPatientIds().join(',')),
      distinctUntilChanged(),
      debounceTime(80),
      switchMap((key) => {
        if (!isPlatformBrowser(this.platformId)) {
          return of<CompareState>({ kind: 'idle' });
        }
        if (!key) {
          return of<CompareState>({ kind: 'nodata' });
        }
        const ids = key.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
        if (ids.length > PERFORMANCE_COMPARE_MAX_PATIENTS) {
          return of<CompareState>({
            kind: 'error',
            message: `Máximo ${PERFORMANCE_COMPARE_MAX_PATIENTS} pacientes por comparativa.`,
          });
        }
        return concat(
          of<CompareState>({ kind: 'loading' }),
          this.compareApi.compare({ patientIds: ids }).pipe(
            map((data) => ({ kind: 'ok', data }) as CompareState),
            catchError((e: HttpErrorResponse) => {
              const msg = httpErrorDetail(e) ?? `Error ${e.status}`;
              return of<CompareState>({ kind: 'error', message: msg });
            }),
          ),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ),
    { initialValue: { kind: 'nodata' } satisfies CompareState },
  );

  readonly individualPayload = computed(() => {
    const s = this.compareResult();
    if (s.kind !== 'ok') {
      return null;
    }
    const id = Number(this.individualPatientId());
    return s.data.patients.find((p: PerformanceComparePatient) => p.patientId === id) ?? null;
  });

  readonly individualMetaPoints = computed(() => {
    const pl = this.individualPayload();
    if (!pl?.temporalSeries?.length) {
      return '';
    }
    const meta = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.metaValue);
    const real = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.observedValue);
    return this.linePointsFor(meta, meta, real);
  });

  readonly individualRealPoints = computed(() => {
    const pl = this.individualPayload();
    if (!pl?.temporalSeries?.length) {
      return '';
    }
    const meta = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.metaValue);
    const real = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.observedValue);
    return this.linePointsFor(real, meta, real);
  });

  readonly individualDots = computed(() => {
    const pl = this.individualPayload();
    if (!pl?.temporalSeries?.length) {
      return [] as Dot[];
    }
    const meta = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.metaValue);
    const real = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.observedValue);
    const trends = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.trend);
    const labels = pl.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.periodLabel);
    return this.dotsFromSeries(meta, real, trends, labels, 360, 200, 16);
  });

  readonly compareLoading = computed(() => this.compareResult().kind === 'loading');
  readonly compareErrorMessage = computed(() => {
    const s = this.compareResult();
    return s.kind === 'error' ? s.message : null;
  });

  protected readonly chartTooltip = signal<{ x: number; y: number; text: string } | null>(null);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.patientsApi.list({ includeDeleted: false, page_size: 50 }).subscribe({
        next: (res: PaginatedTherapistPatientsDto) => {
          const opts = res.results.map((r: TherapistPatientRowDto) => ({ id: String(r.patientId), label: r.fullName }));
          this.patientOptions.set(opts);
          if (opts.length && !this.individualPatientId()) {
            this.individualPatientId.set(opts[0].id);
          }
          if (opts.length && this.groupPatientIds().size === 0) {
            const g = new Set<string>();
            g.add(opts[0].id);
            if (opts[1]) {
              g.add(opts[1].id);
            }
            this.groupPatientIds.set(g);
          }
        },
        error: () => {
          /* sin opciones: la comparativa quedará en nodata / error al no poder pedir datos */
        },
      });
    });
  }

  strokeClassAt(index: number): string {
    return GROUP_STROKE_CLASSES[index % GROUP_STROKE_CLASSES.length] ?? 'text-pm-primary';
  }

  groupPolylinePoints(patientId: string): string {
    const s = this.compareResult();
    if (s.kind !== 'ok') {
      return '';
    }
    const patient = s.data.patients.find((p: PerformanceComparePatient) => p.patientId === Number(patientId));
    if (!patient?.temporalSeries?.length) {
      return '';
    }
    const vals = patient.temporalSeries.map((r: PerformanceCompareTemporalPoint) => r.observedValue);
    const gb = s.data.groupBounds;
    const lo = Math.min(gb.minObserved, gb.minMeta);
    const hi = Math.max(gb.maxObserved, gb.maxMeta);
    const span = hi - lo || 1;
    const pad = span * 0.08;
    return this.linePointsForValues(vals, lo - pad, hi + pad, 420, 220, 20);
  }

  toggleGroup(id: string, checked: boolean): void {
    this.groupPatientIds.update((prev) => {
      const next = new Set(prev);
      if (checked) {
        const candidate = new Set(next);
        candidate.add(id);
        if (this.mergedIdCount(candidate) > PERFORMANCE_COMPARE_MAX_PATIENTS) {
          this.toast.show(`Máximo ${PERFORMANCE_COMPARE_MAX_PATIENTS} pacientes en la comparativa.`);
          return prev;
        }
        next.add(id);
      } else if (next.size > 1) {
        next.delete(id);
      }
      return next;
    });
  }

  isGroupChecked(id: string): boolean {
    return this.groupPatientIds().has(id);
  }

  showTip(ev: MouseEvent, text: string): void {
    const rect = (ev.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    this.chartTooltip.set({
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top - 8,
      text,
    });
  }

  clearTip(): void {
    this.chartTooltip.set(null);
  }

  nameForPatientId(pid: string): string {
    const s = this.compareResult();
    if (s.kind === 'ok') {
      const p = s.data.patients.find((x: PerformanceComparePatient) => String(x.patientId) === pid);
      if (p) {
        return p.fullName;
      }
    }
    return this.patientOptions().find((o) => o.id === pid)?.label ?? pid;
  }

  tipForDot(d: Dot): string {
    const patientName = this.nameForPatientId(this.individualPatientId());
    return ` ${patientName}: ${d.periodLabel} (observado ${d.real}° · meta ${d.meta}°)`;
  }

  formatRecoveryPct(v: number | null | undefined): string {
    if (v == null || Number.isNaN(Number(v))) {
      return '';
    }
    return `${Number(v).toFixed(1)}%`;
  }

  private mergedIdCount(group: Set<string>): number {
    const ids = new Set<number>();
    const ind = this.individualPatientId().trim();
    if (ind && /^\d+$/.test(ind)) {
      const n = Number(ind);
      if (n > 0) {
        ids.add(n);
      }
    }
    for (const g of group) {
      const n = Number(g);
      if (Number.isInteger(n) && n > 0) {
        ids.add(n);
      }
    }
    return ids.size;
  }

  private computeQueryPatientIds(): number[] {
    const ids = new Set<number>();
    const ind = this.individualPatientId().trim();
    if (ind && /^\d+$/.test(ind)) {
      const n = Number(ind);
      if (n > 0) {
        ids.add(n);
      }
    }
    for (const g of this.groupPatientIds()) {
      const n = Number(g);
      if (Number.isInteger(n) && n > 0) {
        ids.add(n);
      }
    }
    return [...ids].sort((a, b) => a - b);
  }

  private linePointsFor(values: number[], meta: number[], real: number[]): string {
    const combined = [...meta, ...real];
    const { min, max } = boundsFrom(combined);
    return this.linePointsForValues(values, min, max, 360, 200, 16);
  }

  private linePointsForValues(
    values: number[],
    min: number,
    max: number,
    width: number,
    height: number,
    pad: number,
  ): string {
    const n = values.length;
    if (n < 2) {
      return '';
    }
    const span = max - min || 1;
    return values
      .map((v, i) => {
        const x = pad + (i / (n - 1)) * (width - pad * 2);
        const y = height - pad - ((v - min) / span) * (height - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  private dotsFromSeries(
    meta: number[],
    real: number[],
    trends: string[],
    periodLabels: string[],
    width: number,
    height: number,
    pad: number,
  ): Dot[] {
    const n = real.length;
    if (n < 2) {
      return [];
    }
    const combined = [...meta, ...real];
    const { min, max } = boundsFrom(combined);
    const span = max - min || 1;
    return real.map((v, i) => {
      const x = pad + (i / (n - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      const m = meta[i] ?? v;
      const tr = trends[i] ?? '';
      const regression = tr === 'regressed' || (!tr && v < m);
      return {
        cx: x,
        cy: y,
        meta: m,
        real: v,
        regression,
        periodLabel: periodLabels[i] ?? `Punto ${i + 1}`,
      };
    });
  }
}

function boundsFrom(values: number[]): { min: number; max: number } {
  if (!values.length) {
    return { min: 0, max: 100 };
  }
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  return { min, max };
}
