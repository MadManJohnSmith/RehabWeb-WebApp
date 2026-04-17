import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from '../../../core/toast.service';

type PatientDetail = {
  id: string;
  name: string;
  condition: string;
  recoveryScore: number;
  vasPain: number;
  status: string;
  /** 0–100 por semana */
  meta: number[];
  real: number[];
  joints: { label: string; score: number }[];
};

const MOCK: Record<string, PatientDetail> = {
  'p-001': {
    id: 'p-001',
    name: 'James Thornton',
    condition: 'Hombro postoperatorio',
    recoveryScore: 78,
    vasPain: 3.2,
    status: 'Mejorando',
    meta: [52, 54, 56, 58, 60, 62, 64],
    real: [50, 55, 53, 62, 66, 64, 71],
    joints: [
      { label: 'Flexión del hombro', score: 72 },
      { label: 'Abducción', score: 68 },
      { label: 'Rotación externa', score: 61 },
    ],
  },
  'p-002': {
    id: 'p-002',
    name: 'María Santos',
    condition: 'Rodilla — ACL',
    recoveryScore: 84,
    vasPain: 2.1,
    status: 'Mejorando',
    meta: [48, 50, 52, 55, 57, 60, 62],
    real: [46, 49, 54, 58, 63, 67, 70],
    joints: [
      { label: 'Flexión de rodilla', score: 81 },
      { label: 'Extensión', score: 88 },
      { label: 'Estabilidad monopodal', score: 79 },
    ],
  },
  'p-003': {
    id: 'p-003',
    name: 'Lucía Fernández',
    condition: 'Tobillo — esguince',
    recoveryScore: 69,
    vasPain: 4.0,
    status: 'Estable',
    meta: [44, 46, 48, 50, 52, 54, 56],
    real: [42, 45, 44, 49, 53, 52, 55],
    joints: [
      { label: 'Dorsiflexión', score: 64 },
      { label: 'Inversión / eversión', score: 58 },
      { label: 'Carga progresiva', score: 72 },
    ],
  },
  'p-004': {
    id: 'p-004',
    name: 'Carlos Méndez',
    condition: 'Lumbar — rehabilitación',
    recoveryScore: 73,
    vasPain: 3.6,
    status: 'Mejorando',
    meta: [50, 52, 53, 55, 56, 58, 60],
    real: [48, 51, 54, 53, 59, 61, 63],
    joints: [
      { label: 'Flexión lumbar', score: 70 },
      { label: 'Extensión controlada', score: 66 },
      { label: 'Core — plancha', score: 78 },
    ],
  },
};

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
    return MOCK[id] ?? MOCK['p-001'];
  });

  protected readonly chartDots = computed(() => {
    const p = this.patient();
    return this.dotsFromSeries(p.meta, p.real, 360, 200, 16);
  });

  protected readonly chartTooltip = signal<{ x: number; y: number; text: string } | null>(null);

  constructor() {
    afterNextRender(() => {
      if (!MOCK[this.patientId()] && this.patientId()) {
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
