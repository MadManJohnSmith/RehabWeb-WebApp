import { isPlatformBrowser, NgClass } from '@angular/common';
import { afterNextRender, Component, DestroyRef, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import type { SessionDetailDto, SessionListRowDto } from '../../data/session-history.dto';
import { PatientsApiService } from '../../services/patients-api.service';
import { SessionHistoryApiService } from '../../services/session-history-api.service';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { Title } from '@angular/platform-browser';

type SessionListVm = {
  rows: SessionListRowDto[];
  total: number;
  loading: boolean;
  error: string | null;
};

@Component({
  selector: 'app-session-history-page',
  standalone: true,
  imports: [NgClass, UiIconComponent, RouterLink],
  templateUrl: './session-history-page.component.html',
})
export class SessionHistoryPageComponent {
  private readonly api = inject(SessionHistoryApiService);
  private readonly patientsApi = inject(PatientsApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly titleService = inject(Title);

  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(5);
  readonly patientFilter = signal('');
  readonly refreshTick = signal(0);

  readonly patientFilterOptions = signal<{ id: string; label: string }[]>([
    { id: '', label: 'Todos los pacientes' },
  ]);

  readonly pageSizeOptions = [5, 10, 15] as const;

  readonly listVm = toSignal(
    combineLatest([
      toObservable(this.search),
      toObservable(this.page),
      toObservable(this.pageSize),
      toObservable(this.patientFilter),
      toObservable(this.refreshTick),
    ]).pipe(
      switchMap(([q, page, pageSize, patientId]) =>
        this.api
          .searchSessions({
            q,
            page,
            pageSize,
            patientId: patientId || undefined,
          })
          .pipe(
            map(
              (res) =>
                ({
                  rows: res.rows,
                  total: res.total,
                  loading: false,
                  error: null,
                }) satisfies SessionListVm,
            ),
            startWith({
              rows: [] as SessionListRowDto[],
              total: 0,
              loading: true,
              error: null,
            } satisfies SessionListVm),
            catchError(() =>
              of({
                rows: [],
                total: 0,
                loading: false,
                error: 'No se pudo cargar el historial. ¿API en marcha y sesión iniciada?',
              } satisfies SessionListVm),
            ),
          ),
      ),
    ),
    {
      initialValue: {
        rows: [],
        total: 0,
        loading: true,
        error: null,
      } satisfies SessionListVm,
    },
  );

  readonly listRows = computed(() => this.listVm().rows);
  readonly listTotal = computed(() => this.listVm().total);
  readonly listLoading = computed(() => this.listVm().loading);
  readonly listError = computed(() => this.listVm().error);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.listTotal() / this.pageSize())),
  );

  readonly detailOpen = signal(false);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly detail = signal<SessionDetailDto | null>(null);

  constructor() {
    this.titleService.setTitle('Historial de sesiones | RehabWeb');
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.patientsApi.list({ includeDeleted: false, page_size: 50 }).subscribe({
        next: (res) => {
          const base = { id: '', label: 'Todos los pacientes' };
          const rest = res.results.map((r) => ({
            id: String(r.patientId),
            label: r.fullName,
          }));
          this.patientFilterOptions.set([base, ...rest]);
        },
        error: () => {
          /* solo "Todos" */
        },
      });
    });
  }

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

  retryList(): void {
    this.refreshTick.update((n) => n + 1);
  }

  openDetail(row: SessionListRowDto): void {
    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.detailError.set(null);
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
          this.detailError.set('No se pudo cargar el detalle de la sesión desde el API.');
          this.toast.show('Error al cargar el detalle de la sesión.');
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
    this.toast.show(`Reporte técnico (sesión ${row.id}): pendiente de endpoint en el API.`);
  }

  viewReportFirstVisible(): void {
    const r = this.listRows()[0];
    if (r) {
      this.viewReport(r);
    }
  }

  formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
}
