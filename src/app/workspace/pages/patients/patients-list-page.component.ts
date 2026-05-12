import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import type { TherapistPatientRowDto } from '../../data/patients-api.types';
import { PatientsApiService } from '../../services/patients-api.service';
import { ToastService } from '../../../core/toast.service';

export type ClinicalStatus = 'riesgo' | 'activo' | 'alta';

@Component({
  selector: 'app-patients-list-page',
  standalone: true,
  imports: [RouterLink, UiIconComponent, FormsModule, NgClass],
  templateUrl: './patients-list-page.component.html',
})
export class PatientsListPageComponent {
  private readonly api = inject(PatientsApiService);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly search = signal('');
  readonly menuOpenLinkId = signal<number | null>(null);

  readonly linkModalOpen = signal(false);
  readonly linkExternalId = signal('');
  readonly linkName = signal('');
  readonly linkCondition = signal('');
  readonly linkClinicalStatus = signal<ClinicalStatus>('activo');

  readonly editModal = signal<{ linkId: number; label: string } | null>(null);
  readonly editConditionDraft = signal('');

  readonly rows = signal<TherapistPatientRowDto[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  constructor() {
    toObservable(this.search)
      .pipe(skip(1), debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.load());

    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .list({
        q: this.search(),
        includeDeleted: true,
        page: 1,
        page_size: 50,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.results);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set('No se pudo cargar el directorio. ¿Está el API en marcha y tienes sesión?');
          this.toast.show(this.loadError() ?? 'Error al cargar pacientes.');
        },
      });
  }

  onSearch(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
  }

  toggleMenu(linkId: number): void {
    this.menuOpenLinkId.update((open) => (open === linkId ? null : linkId));
  }

  closeMenu(): void {
    this.menuOpenLinkId.set(null);
  }

  openEdit(row: TherapistPatientRowDto): void {
    this.closeMenu();
    this.editModal.set({ linkId: row.linkId, label: String(row.patientId) });
    this.editConditionDraft.set(row.primaryDiagnosis ?? '');
  }

  closeEdit(): void {
    this.editModal.set(null);
  }

  saveEdit(): void {
    const m = this.editModal();
    if (!m) {
      return;
    }
    const v = this.editConditionDraft().trim();
    if (!v) {
      this.toast.show('El diagnóstico no puede quedar vacío.');
      return;
    }
    this.api.patchLink(m.linkId, { primaryDiagnosis: v }).subscribe({
      next: () => {
        this.toast.show('Diagnóstico actualizado.');
        this.closeEdit();
        this.load();
      },
      error: () => this.toast.show('No se pudo guardar el diagnóstico.'),
    });
  }

  confirmUnlink(row: TherapistPatientRowDto): void {
    this.closeMenu();
    if (!globalThis.confirm(`¿Desvincular a ${row.fullName}?`)) {
      return;
    }
    this.api.unlink(row.linkId).subscribe({
      next: () => {
        this.toast.show('Paciente desvinculado.');
        this.load();
      },
      error: () => this.toast.show('No se pudo desvincular.'),
    });
  }

  confirmRestore(row: TherapistPatientRowDto): void {
    this.closeMenu();
    if (!globalThis.confirm(`¿Reactivar vinculación de ${row.fullName}?`)) {
      return;
    }
    this.api.restore(row.linkId).subscribe({
      next: () => {
        this.toast.show('Vinculación reactivada.');
        this.load();
      },
      error: () => this.toast.show('No se pudo reactivar.'),
    });
  }

  openLink(): void {
    this.linkExternalId.set('');
    this.linkName.set('');
    this.linkCondition.set('');
    this.linkClinicalStatus.set('activo');
    this.linkModalOpen.set(true);
  }

  closeLink(): void {
    this.linkModalOpen.set(false);
  }

  saveLink(): void {
    const name = this.linkName().trim();
    const condition = this.linkCondition().trim();
    if (!name || !condition) {
      this.toast.show('Completa nombre y diagnóstico principal.');
      return;
    }
    const ext = this.linkExternalId().trim();
    const body: {
      fullName: string;
      primaryDiagnosis: string;
      clinicalStatus: ClinicalStatus;
      associationId?: string;
    } = {
      fullName: name,
      primaryDiagnosis: condition,
      clinicalStatus: this.linkClinicalStatus(),
    };
    if (ext) {
      body.associationId = ext;
    }
    this.api.link(body).subscribe({
      next: () => {
        this.toast.show('Paciente vinculado.');
        this.closeLink();
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        const d = err.error?.detail;
        this.toast.show(typeof d === 'string' ? d : 'No se pudo vincular (revisa datos o permisos).');
      },
    });
  }

  statusBadgeClass(s: ClinicalStatus): Record<string, boolean> {
    return {
      'bg-pm-danger-bg text-pm-danger dark:bg-pm-danger-bg-dark dark:text-pm-danger-dark': s === 'riesgo',
      'bg-pm-primary-soft text-pm-primary dark:bg-pm-primary-soft-dark dark:text-pm-primary': s === 'activo',
      'bg-pm-canvas text-pm-muted dark:bg-pm-canvas-dark dark:text-pm-muted-dark': s === 'alta',
      'ring-1 ring-pm-border dark:ring-pm-border-dark': s === 'alta',
    };
  }

  onLinkStatusChange(value: string): void {
    if (value === 'riesgo' || value === 'activo' || value === 'alta') {
      this.linkClinicalStatus.set(value);
    }
  }

  rowOpacity(row: TherapistPatientRowDto): string {
    return row.deletedAt || row.isUnlinked ? 'opacity-55' : '';
  }

  formatLastSession(iso: string | null): string {
    if (!iso) {
      return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso.slice(0, 10);
    }
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
