import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import {
  MAX_CLINICAL_EXPORT_RANGE_DAYS,
  type ClinicalExportApiRequestDto,
} from '../../data/clinical-export-request.dto';
import { ClinicalExportApiService } from '../../services/clinical-export-api.service';
import { PatientsApiService } from '../../services/patients-api.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [FormsModule, UiIconComponent],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly clinicalExport = inject(ClinicalExportApiService);
  private readonly patientsApi = inject(PatientsApiService);

  pacienteId = '';
  desde = '2026-01-01';
  hasta = '2026-04-16';
  protected readonly estado = signal<string>('');
  protected readonly exportBusy = signal(false);
  readonly maxExportRangeDays = MAX_CLINICAL_EXPORT_RANGE_DAYS;

  readonly patientOptions = signal<{ id: string; label: string }[]>([
    { id: '', label: 'Seleccione un paciente…' },
  ]);
  readonly patientsLoading = signal(true);
  readonly patientsLoadError = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.loadPatients();
    });
  }

  loadPatients(): void {
    this.patientsLoading.set(true);
    this.patientsLoadError.set(null);
    this.patientsApi.list({ includeDeleted: false, page_size: 50 }).subscribe({
      next: (res) => {
        const head = { id: '', label: 'Seleccione un paciente…' };
        const rest = res.results.map((r) => ({
          id: String(r.patientId),
          label: r.fullName,
        }));
        this.patientOptions.set([head, ...rest]);
        this.patientsLoading.set(false);
      },
      error: () => {
        this.patientsLoading.set(false);
        this.patientsLoadError.set(
          'No se pudo cargar el listado de pacientes. Comprueba el API y tu sesión, luego reintenta.',
        );
      },
    });
  }

  export(kind: 'xlsx' | 'pdf'): void {
    const err = this.validateFilters();
    if (err) {
      this.estado.set('');
      this.toast.show(`No se puede exportar: ${err}`);
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const patientId = Number(this.pacienteId);
    const body: ClinicalExportApiRequestDto = {
      patientId,
      dateFrom: this.desde,
      dateTo: this.hasta,
      format: kind === 'pdf' ? 'pdf' : 'xlsx',
    };

    const label = kind === 'pdf' ? 'PDF' : 'XLSX';
    this.exportBusy.set(true);
    this.clinicalExport
      .requestExport(body)
      .pipe(finalize(() => this.exportBusy.set(false)))
      .subscribe({
        next: ({ blob, filename }) => {
          this.triggerFileDownload(blob, filename);
          this.estado.set(`Última descarga (${label}): ${filename}`);
          this.toast.show(`Informe listo: ${filename}`);
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Error al exportar.';
          this.estado.set('');
          this.toast.show(msg);
        },
      });
  }

  isFormValid(): boolean {
    return this.validateFilters() === null;
  }

  private validateFilters(): string | null {
    if (!this.pacienteId?.trim()) {
      return 'debe elegir un paciente.';
    }
    const patientId = Number(this.pacienteId);
    if (!Number.isInteger(patientId) || patientId < 1) {
      return 'el paciente seleccionado no es válido.';
    }
    if (!this.desde?.trim() || !this.hasta?.trim()) {
      return 'indique fecha desde y hasta.';
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.desde) || !/^\d{4}-\d{2}-\d{2}$/.test(this.hasta)) {
      return 'use fechas en formato AAAA-MM-DD.';
    }
    const diffDays = this.calendarDiffDays(this.desde, this.hasta);
    if (diffDays < 0) {
      return '«Desde» no puede ser posterior a «Hasta».';
    }
    if (diffDays > MAX_CLINICAL_EXPORT_RANGE_DAYS) {
      return `el rango no puede superar ${MAX_CLINICAL_EXPORT_RANGE_DAYS} días.`;
    }
    return null;
  }

  /** Diferencia en días entre dos fechas calendario (UTC), coherente con el validador del API. */
  private calendarDiffDays(fromYmd: string, toYmd: string): number {
    const [y0, m0, d0] = fromYmd.split('-').map(Number);
    const [y1, m1, d1] = toYmd.split('-').map(Number);
    const t0 = Date.UTC(y0, m0 - 1, d0);
    const t1 = Date.UTC(y1, m1 - 1, d1);
    return Math.round((t1 - t0) / 86400000);
  }

  private triggerFileDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.click();
    URL.revokeObjectURL(url);
  }
}
