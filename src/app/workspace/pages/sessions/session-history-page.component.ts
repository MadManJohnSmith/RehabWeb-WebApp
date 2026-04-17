import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

export type SessionStatus = 'Excelente' | 'Bueno' | 'Regular';

export type SessionRow = {
  id: string;
  date: string;
  patient: string;
  program: string;
  durationMin: number;
  score: number;
  status: SessionStatus;
};

@Component({
  selector: 'app-session-history-page',
  standalone: true,
  imports: [NgClass, UiIconComponent],
  templateUrl: './session-history-page.component.html',
})
export class SessionHistoryPageComponent {
  private readonly toast = inject(ToastService);

  protected readonly search = signal('');
  protected readonly page = signal(1);
  readonly pageSize = 5;

  private readonly allRows: SessionRow[] = [
    {
      id: 'SES-2048',
      date: '2026-04-15',
      patient: 'James Thornton',
      program: 'ROM hombro — fase II',
      durationMin: 42,
      score: 91,
      status: 'Excelente',
    },
    {
      id: 'SES-2047',
      date: '2026-04-15',
      patient: 'María Santos',
      program: 'ACL — fortalecimiento',
      durationMin: 38,
      score: 84,
      status: 'Bueno',
    },
    {
      id: 'SES-2046',
      date: '2026-04-14',
      patient: 'Lucía Fernández',
      program: 'Tobillo — propiocepción',
      durationMin: 33,
      score: 76,
      status: 'Bueno',
    },
    {
      id: 'SES-2045',
      date: '2026-04-14',
      patient: 'Carlos Méndez',
      program: 'Lumbar — estabilidad',
      durationMin: 45,
      score: 62,
      status: 'Regular',
    },
    {
      id: 'SES-2044',
      date: '2026-04-13',
      patient: 'James Thornton',
      program: 'ROM hombro — fase II',
      durationMin: 40,
      score: 88,
      status: 'Excelente',
    },
    {
      id: 'SES-2043',
      date: '2026-04-12',
      patient: 'Ana Ruiz',
      program: 'Cadera — movilidad',
      durationMin: 36,
      score: 71,
      status: 'Bueno',
    },
    {
      id: 'SES-2042',
      date: '2026-04-11',
      patient: 'María Santos',
      program: 'ACL — fortalecimiento',
      durationMin: 41,
      score: 58,
      status: 'Regular',
    },
  ];

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) {
      return this.allRows;
    }
    return this.allRows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.patient.toLowerCase().includes(q) ||
        r.program.toLowerCase().includes(q),
    );
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly pageRows = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  onSearchInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.search.set(v);
    this.page.set(1);
  }

  setPage(p: number): void {
    const clamped = Math.min(Math.max(1, p), this.totalPages());
    this.page.set(clamped);
  }

  statusNgClass(row: SessionRow): Record<string, boolean> {
    return {
      'bg-pm-primary-soft text-pm-primary dark:bg-pm-primary-soft-dark dark:text-pm-primary':
        row.status === 'Excelente',
      'bg-pm-info-soft text-pm-info dark:bg-slate-800 dark:text-pm-info': row.status === 'Bueno',
      'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100': row.status === 'Regular',
    };
  }

  formatDuration(m: number): string {
    return `${m} min`;
  }

  viewReport(row: SessionRow): void {
    this.toast.show(`Reporte completo (${row.id}): simulación sin conexión al servidor.`);
  }

  viewSession(row: SessionRow): void {
    this.toast.show(`Detalle de sesión (${row.id}): simulación sin conexión al servidor.`);
  }

  viewReportFromPage(): void {
    const row = this.pageRows()[0];
    if (!row) {
      this.toast.show('No hay sesiones en esta página.');
      return;
    }
    this.viewReport(row);
  }

  viewSessionFromPage(): void {
    const row = this.pageRows()[0];
    if (!row) {
      this.toast.show('No hay sesiones en esta página.');
      return;
    }
    this.viewSession(row);
  }
}
