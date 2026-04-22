import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import {
  type ClinicalStatus,
  type PatientDirectoryRow,
  PatientsRegistryService,
} from '../../services/patients-registry.service';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-patients-list-page',
  standalone: true,
  imports: [RouterLink, UiIconComponent, FormsModule, NgClass],
  templateUrl: './patients-list-page.component.html',
})
export class PatientsListPageComponent {
  private readonly registry = inject(PatientsRegistryService);
  private readonly toast = inject(ToastService);

  readonly search = signal('');
  readonly menuOpenId = signal<string | null>(null);

  readonly linkModalOpen = signal(false);
  readonly linkExternalId = signal('');
  readonly linkName = signal('');
  readonly linkCondition = signal('');
  readonly linkClinicalStatus = signal<ClinicalStatus>('activo');

  readonly editModal = signal<{ id: string } | null>(null);
  readonly editConditionDraft = signal('');

  readonly filteredRows = computed(() => {
    this.registry.directorySorted();
    const q = this.search().trim().toLowerCase();
    return this.registry.directorySorted().filter((r) => {
      if (!q) {
        return true;
      }
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.externalUniqueId.toLowerCase().includes(q) ||
        r.condition.toLowerCase().includes(q)
      );
    });
  });

  onSearch(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
  }

  toggleMenu(id: string): void {
    this.menuOpenId.update((open) => (open === id ? null : id));
  }

  closeMenu(): void {
    this.menuOpenId.set(null);
  }

  openEdit(row: PatientDirectoryRow): void {
    this.closeMenu();
    this.editModal.set({ id: row.id });
    this.editConditionDraft.set(row.condition);
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
    this.registry.updateCondition(m.id, v);
    this.toast.show('Diagnóstico actualizado (mock + localStorage).');
    this.closeEdit();
  }

  confirmUnlink(row: PatientDirectoryRow): void {
    this.closeMenu();
    if (!globalThis.confirm(`¿Desvincular a ${row.name}? (borrado lógico en la demo)`)) {
      return;
    }
    this.registry.unlink(row.id);
    this.toast.show('Paciente desvinculado (soft delete). Sigue visible atenuado en la lista.');
  }

  confirmRestore(row: PatientDirectoryRow): void {
    this.closeMenu();
    if (!globalThis.confirm(`¿Reactivar vinculación de ${row.name}?`)) {
      return;
    }
    this.registry.restore(row.id);
    this.toast.show('Paciente reactivado en el directorio (demo).');
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
    const ext = this.linkExternalId().trim();
    const name = this.linkName().trim();
    const condition = this.linkCondition().trim();
    if (!ext || !name || !condition) {
      this.toast.show('Completa identificador, nombre y diagnóstico.');
      return;
    }
    const id = this.registry.linkPatient({
      externalUniqueId: ext,
      name,
      condition,
      clinicalStatus: this.linkClinicalStatus(),
    });
    this.toast.show(`Paciente vinculado con ID ${id} (persistido en localStorage).`);
    this.closeLink();
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

  rowOpacity(row: PatientDirectoryRow): string {
    return row.deletedAt ? 'opacity-55' : '';
  }
}
