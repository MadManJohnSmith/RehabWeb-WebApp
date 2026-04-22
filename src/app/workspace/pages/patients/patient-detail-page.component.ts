import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PATIENT_DETAIL_MOCK } from '../../data/patient-detail.mock';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-patient-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './patient-detail-page.component.html',
})
export class PatientDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  private readonly patientId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('patientId') ?? '')),
    { initialValue: '' },
  );

  protected readonly patient = computed(() => {
    const id = this.patientId();
    return PATIENT_DETAIL_MOCK[id] ?? PATIENT_DETAIL_MOCK['p-001'];
  });

  protected readonly chartDots = computed(() => {
    const p = this.patient();
    return this.dotsFromSeries(p.meta, p.real, 360, 200, 16);
  });

  protected readonly chartTooltip = signal<{ x: number; y: number; text: string } | null>(null);

  constructor() {
    afterNextRender(() => {
      if (!(this.patientId() in PATIENT_DETAIL_MOCK) && this.patientId()) {
        this.toast.show('Paciente no encontrado en los datos de demostración; se muestra un ejemplo.');
      }
    });
  }

  linePointsForPatient(values: number[], width = 360, height = 200, pad = 16): string {
    const p = this.patient();
    const all = [...p.meta, ...p.real];
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

  private dotsFromSeries(
    meta: number[],
    real: number[],
    width: number,
    height: number,
    pad: number,
  ): { cx: number; cy: number; meta: number; real: number; regression: boolean }[] {
    const n = real.length;
    if (n < 2) {
      return [];
    }
    const combined = [...meta, ...real];
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

  showPointTip(ev: MouseEvent, text: string): void {
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

  openPlan(): void {
    this.toast.show('Plan completo: pendiente de integración con el servidor.');
  }
}
