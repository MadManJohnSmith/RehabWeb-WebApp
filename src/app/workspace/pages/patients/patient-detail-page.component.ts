import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PATIENT_DETAIL_MOCK, type PatientDetailRecord } from '../../data/patient-detail.mock';
import type { TherapistPatientRowDto } from '../../data/patients-api.types';
import { PatientsApiService } from '../../services/patients-api.service';
import { ToastService } from '../../../core/toast.service';

/** Vista de ficha: cabecera API + gráficos de demostración hasta integrar métricas por paciente. */
export type PatientDetailVm = PatientDetailRecord & {
  api?: TherapistPatientRowDto;
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
  private readonly api = inject(PatientsApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly patientIdParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('patientId') ?? '')),
    { initialValue: '' },
  );

  readonly apiRow = signal<TherapistPatientRowDto | null>(null);
  readonly loadState = signal<'idle' | 'loading' | 'error' | 'ok'>('idle');

  private readonly demoFallback = PATIENT_DETAIL_MOCK['p-001'];

  readonly patient = computed<PatientDetailVm | null>(() => {
    const row = this.apiRow();
    if (!row) {
      return null;
    }
    const d = this.demoFallback;
    return {
      ...d,
      id: String(row.patientId),
      name: row.fullName,
      condition: row.primaryDiagnosis || '—',
      status: row.clinicalStatus,
      api: row,
    };
  });

  protected readonly chartDots = computed(() => {
    const p = this.patient();
    if (!p) {
      return [];
    }
    return this.dotsFromSeries(p.meta, p.real, 360, 200, 16);
  });

  protected readonly chartTooltip = signal<{ x: number; y: number; text: string } | null>(null);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const raw = this.patientIdParam();
      const id = Number.parseInt(raw, 10);
      if (!Number.isFinite(id) || id < 1) {
        this.loadState.set('error');
        this.toast.show('ID de paciente no válido. Usa el número del directorio (API).');
        return;
      }
      this.loadState.set('loading');
      this.api.getFicha(id).subscribe({
        next: (data) => {
          this.apiRow.set(data);
          this.loadState.set('ok');
        },
        error: () => {
          this.loadState.set('error');
          this.toast.show('No se pudo cargar la ficha (¿permisos o ID inexistente?).');
        },
      });
    });
  }

  linePointsForPatient(values: number[], width = 360, height = 200, pad = 16): string {
    const p = this.patient();
    if (!p) {
      return '';
    }
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
    this.toast.show('Plan completo: pendiente de endpoint dedicado en el API.');
  }

  formatIso(iso: string | null | undefined): string {
    if (!iso) {
      return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso.slice(0, 16);
    }
    return d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
