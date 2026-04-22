import { NgClass } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import type { SessionDetailDto, SessionListRowDto } from '../../data/session-history.dto';
import { SESSION_PATIENT_FILTER_OPTIONS } from '../../data/sessions-list.mock';
import { SessionHistoryApiService } from '../../services/session-history-api.service';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-session-history-page',
  standalone: true,
  imports: [NgClass, UiIconComponent, RouterLink],
  templateUrl: './session-history-page.component.html',
})
export class SessionHistoryPageComponent {
  private readonly api = inject(SessionHistoryApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(5);
  readonly patientFilter = signal('');

  readonly patientFilterOptions = SESSION_PATIENT_FILTER_OPTIONS;
  readonly pageSizeOptions = [5, 10, 15] as const;

  readonly listResult = toSignal(
    combineLatest([
      toObservable(this.search),
      toObservable(this.page),
      toObservable(this.pageSize),
      toObservable(this.patientFilter),
    ]).pipe(
      switchMap(([q, page, pageSize, patientId]) =>
        this.api.searchSessions({
          q,
          page,
          pageSize,
          patientId: patientId || undefined,
        }),
      ),
    ),
    { initialValue: { rows: [] as SessionListRowDto[], total: 0 } },
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.listResult().total / this.pageSize())),
  );

  readonly detailOpen = signal(false);
  readonly detailLoading = signal(false);
  readonly detail = signal<SessionDetailDto | null>(null);

  onSearchInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.search.set(v);
    this.page.set(1);
  }

  onPatientFilterChange(ev: Event): void {
    this.patientFilter.set((ev.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  setPageSize(n: number): void {
    this.pageSize.set(n);
    this.page.set(1);
  }

  setPage(p: number): void {
    const clamped = Math.min(Math.max(1, p), this.totalPages());
    this.page.set(clamped);
  }

  openDetail(row: SessionListRowDto): void {
    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.detail.set(null);
    this.api
      .getSessionDetail(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d) => {
          this.detail.set(d);
          this.detailLoading.set(false);
        },
        error: () => {
          this.detailLoading.set(false);
          this.toast.show('No se pudo cargar el detalle (revisa red o el archivo /mock/session-history.json).');
        },
      });
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  statusNgClass(row: SessionListRowDto): Record<string, boolean> {
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

  viewReport(row: SessionListRowDto): void {
    this.toast.show(`Reporte técnico (${row.id}): simulación; en producción vendría del servidor.`);
  }

  viewReportFirstVisible(): void {
    const r = this.listResult().rows[0];
    if (r) {
      this.viewReport(r);
    }
  }
}
