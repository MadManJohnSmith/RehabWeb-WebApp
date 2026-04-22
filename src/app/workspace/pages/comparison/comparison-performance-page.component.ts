import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PATIENT_DETAIL_IDS, PATIENT_DETAIL_MOCK } from '../../data/patient-detail.mock';

type Dot = { cx: number; cy: number; meta: number; real: number; regression: boolean };

const GROUP_STROKE_CLASSES = [
  'text-pm-primary',
  'text-amber-600 dark:text-amber-400',
  'text-pm-info',
  'text-pm-coral',
] as const;

@Component({
  selector: 'app-comparison-performance-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './comparison-performance-page.component.html',
})
export class ComparisonPerformancePageComponent {
  readonly mock = PATIENT_DETAIL_MOCK;
  readonly patientIds = [...PATIENT_DETAIL_IDS];

  readonly individualId = signal<string>('p-001');

  private readonly groupIds = signal<Set<string>>(new Set(['p-001', 'p-002']));

  readonly groupOrderedIds = computed(() => [...this.groupIds()].sort());

  readonly individualPatient = computed(() => {
    const id = this.individualId();
    return this.mock[id] ?? this.mock['p-001'];
  });

  readonly individualMetaPoints = computed(() => {
    const p = this.individualPatient();
    return this.linePointsFor(p.meta, p.meta, p.real);
  });

  readonly individualRealPoints = computed(() => {
    const p = this.individualPatient();
    return this.linePointsFor(p.real, p.meta, p.real);
  });

  readonly individualDots = computed(() => {
    const p = this.individualPatient();
    return this.dotsFromSeries(p.meta, p.real, 360, 200, 16);
  });

  readonly groupBounds = computed(() => {
    const vals: number[] = [];
    for (const id of this.groupOrderedIds()) {
      const p = this.mock[id];
      if (p) {
        vals.push(...p.meta, ...p.real);
      }
    }
    return boundsFrom(vals);
  });

  protected readonly chartTooltip = signal<{ x: number; y: number; text: string } | null>(null);

  strokeClassAt(index: number): string {
    return GROUP_STROKE_CLASSES[index % GROUP_STROKE_CLASSES.length] ?? 'text-pm-primary';
  }

  groupPolylinePoints(patientId: string): string {
    const p = this.mock[patientId];
    if (!p) {
      return '';
    }
    const { min, max } = this.groupBounds();
    return this.linePointsForValues(p.real, min, max, 420, 220, 20);
  }

  toggleGroup(id: string, checked: boolean): void {
    this.groupIds.update((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else if (next.size > 1) {
        next.delete(id);
      }
      return next;
    });
  }

  isGroupChecked(id: string): boolean {
    return this.groupIds().has(id);
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

  private dotsFromSeries(meta: number[], real: number[], width: number, height: number, pad: number): Dot[] {
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
      return { cx: x, cy: y, meta: m, real: v, regression: v < m };
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
