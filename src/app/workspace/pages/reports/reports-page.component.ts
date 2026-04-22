import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import type { ClinicalExportFiltersDto } from '../../data/clinical-export-request.dto';
import { TherapistSessionService } from '../../services/therapist-session.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [FormsModule, UiIconComponent],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly therapistSession = inject(TherapistSessionService);

  pacienteId = '';
  desde = '2026-01-01';
  hasta = '2026-04-16';
  protected readonly estado = signal<string>('');

  readonly patientOptions = [
    { id: '', label: 'Seleccione un paciente…' },
    { id: 'p-001', label: 'James Thornton' },
    { id: 'p-002', label: 'María Santos' },
    { id: 'p-003', label: 'Lucía Fernández' },
    { id: 'p-004', label: 'Carlos Méndez' },
  ];

  export(kind: 'excel' | 'pdf'): void {
    const err = this.validateFilters();
    if (err) {
      this.estado.set('');
      this.toast.show(`No se puede exportar: ${err}`);
      return;
    }

    const payload: ClinicalExportFiltersDto = {
      patientId: this.pacienteId,
      dateFrom: this.desde,
      dateTo: this.hasta,
    };

    const label = kind === 'excel' ? 'Excel' : 'PDF';
    this.estado.set(
      `Última solicitud (${label}): paciente ${payload.patientId}, ${payload.dateFrom} → ${payload.dateTo}. Cabecera Authorization preparada (mock terapeuta).`,
    );

    if (kind === 'excel') {
      this.downloadMockSpreadsheet(payload);
      this.toast.show(
        'Excel (simulación): se descargó un CSV de demostración. Con el servidor activo se enviaría el mismo filtro por HTTP con JWT de terapeuta.',
      );
      return;
    }

    this.toast.show(
      'PDF (simulación): la generación binaria ocurrirá en el servidor. La petición llevaría el encabezado Authorization (Bearer + JWT de terapeuta) y los filtros acordados al contrato de API.',
    );
  }

  isFormValid(): boolean {
    return this.validateFilters() === null;
  }

  private validateFilters(): string | null {
    if (!this.pacienteId?.trim()) {
      return 'debe elegir un paciente.';
    }
    if (!this.desde?.trim() || !this.hasta?.trim()) {
      return 'indique fecha desde y hasta.';
    }
    const from = new Date(this.desde);
    const to = new Date(this.hasta);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return 'las fechas no son válidas.';
    }
    if (from > to) {
      return '«Desde» no puede ser posterior a «Hasta».';
    }
    return null;
  }

  private downloadMockSpreadsheet(filters: ClinicalExportFiltersDto): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const name =
      this.patientOptions.find((p) => p.id === filters.patientId)?.label?.replace(/\s+/g, '_') ?? 'paciente';
    const header = 'patient_id,date_from,date_to,therapist_role,generated_at_utc';
    const row = `${filters.patientId},${filters.dateFrom},${filters.dateTo},${this.therapistSession.demoRole()},${new Date().toISOString()}`;
    const csv = `${header}\n${row}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_clinico_demo_${name}_${filters.dateFrom}_${filters.dateTo}.csv`;
    a.rel = 'noopener';
    a.click();
    URL.revokeObjectURL(url);
  }
}
