import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import type { PatientDetailRecord } from '../data/patient-detail.mock';
import { PATIENT_DETAIL_IDS, PATIENT_DETAIL_MOCK } from '../data/patient-detail.mock';

const LS_KEY = 'rehabweb.patient-registry.v1';

export type ClinicalStatus = 'riesgo' | 'activo' | 'alta';

export interface PatientDirectoryRow {
  id: string;
  /** Identificador único de negocio (asociación terapeuta–paciente, demo). */
  externalUniqueId: string;
  name: string;
  condition: string;
  lastSession: string;
  clinicalStatus: ClinicalStatus;
  /** ISO 8601 si está desvinculado (soft delete). */
  deletedAt: string | null;
}

interface RegistryPersistence {
  version: 1;
  directory: PatientDirectoryRow[];
  detailExtras: Record<string, PatientDetailRecord>;
}

function seedPersistence(): RegistryPersistence {
  const lastSessions = ['2026-04-15', '2026-04-14', '2026-04-13', '2026-04-12'];
  const statuses: ClinicalStatus[] = ['activo', 'activo', 'riesgo', 'alta'];
  const directory: PatientDirectoryRow[] = PATIENT_DETAIL_IDS.map((id, i) => {
    const p = PATIENT_DETAIL_MOCK[id];
    return {
      id: p.id,
      externalUniqueId: `URN:PAT:${p.id}`,
      name: p.name,
      condition: p.condition,
      lastSession: lastSessions[i] ?? '2026-04-10',
      clinicalStatus: statuses[i] ?? 'activo',
      deletedAt: null,
    };
  });
  return { version: 1, directory, detailExtras: {} };
}

function cloneStubDetail(id: string, name: string, condition: string): PatientDetailRecord {
  const base = PATIENT_DETAIL_MOCK['p-001'];
  return {
    ...base,
    id,
    name,
    condition,
    recoveryScore: 70,
    vasPain: 3,
    status: 'En seguimiento',
    meta: [...base.meta],
    real: [...base.real],
    joints: base.joints.map((j) => ({ ...j })),
  };
}

/**
 * @deprecated El directorio en `/app/pacientes` usa `PatientsApiService`. Conservado para mocks / localStorage hasta migrar otras pantallas.
 */
@Injectable({ providedIn: 'root' })
export class PatientsRegistryService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<RegistryPersistence>(this.loadInitial());

  /** Directorio ordenado: activos primero, luego desvinculados; dentro, por nombre. */
  readonly directorySorted = computed(() => {
    const rows = [...this.state().directory];
    return rows.sort((a, b) => {
      const ad = !!a.deletedAt;
      const bd = !!b.deletedAt;
      if (ad !== bd) {
        return ad ? 1 : -1;
      }
      return a.name.localeCompare(b.name, 'es');
    });
  });

  getDirectoryRow(id: string): PatientDirectoryRow | undefined {
    return this.state().directory.find((r) => r.id === id);
  }

  getDetailExtra(id: string): PatientDetailRecord | undefined {
    return this.state().detailExtras[id];
  }

  updateCondition(id: string, condition: string): void {
    this.state.update((s) => {
      const detailExtras = { ...s.detailExtras };
      if (detailExtras[id]) {
        detailExtras[id] = { ...detailExtras[id], condition };
      }
      return {
        ...s,
        directory: s.directory.map((r) => (r.id === id ? { ...r, condition } : r)),
        detailExtras,
      };
    });
    this.persist();
  }

  unlink(id: string): void {
    const stamp = new Date().toISOString();
    this.state.update((s) => ({
      ...s,
      directory: s.directory.map((r) => (r.id === id ? { ...r, deletedAt: stamp } : r)),
    }));
    this.persist();
  }

  restore(id: string): void {
    this.state.update((s) => ({
      ...s,
      directory: s.directory.map((r) => (r.id === id ? { ...r, deletedAt: null } : r)),
    }));
    this.persist();
  }

  /** Vincular paciente existente (demo): persiste en localStorage y crea ficha mínima para el perfil. */
  linkPatient(input: {
    externalUniqueId: string;
    name: string;
    condition: string;
    clinicalStatus: ClinicalStatus;
  }): string {
    const id = this.nextPatientId();
    const row: PatientDirectoryRow = {
      id,
      externalUniqueId: input.externalUniqueId.trim(),
      name: input.name.trim(),
      condition: input.condition.trim(),
      lastSession: new Date().toISOString().slice(0, 10),
      clinicalStatus: input.clinicalStatus,
      deletedAt: null,
    };
    const stub = cloneStubDetail(row.id, row.name, row.condition);
    this.state.update((s) => ({
      ...s,
      directory: [...s.directory, row],
      detailExtras: { ...s.detailExtras, [id]: stub },
    }));
    this.persist();
    return id;
  }

  private nextPatientId(): string {
    const nums = this.state().directory
      .map((r) => /^p-(\d+)$/.exec(r.id)?.[1])
      .filter((x): x is string => !!x)
      .map((x) => Number(x));
    const fromExtras = Object.keys(this.state().detailExtras)
      .map((k) => /^p-(\d+)$/.exec(k)?.[1])
      .filter((x): x is string => !!x)
      .map((x) => Number(x));
    const base = Math.max(0, ...nums, ...fromExtras, ...PATIENT_DETAIL_IDS.map((id) => Number(id.replace('p-', ''))));
    return `p-${base + 1}`;
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(this.state()));
    } catch {
      /* quota / modo privado */
    }
  }

  private loadInitial(): RegistryPersistence {
    if (!isPlatformBrowser(this.platformId)) {
      return seedPersistence();
    }
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        return seedPersistence();
      }
      const parsed = JSON.parse(raw) as RegistryPersistence;
      if (parsed?.version !== 1 || !Array.isArray(parsed.directory)) {
        return seedPersistence();
      }
      return {
        version: 1,
        directory: parsed.directory,
        detailExtras: parsed.detailExtras && typeof parsed.detailExtras === 'object' ? parsed.detailExtras : {},
      };
    } catch {
      return seedPersistence();
    }
  }
}
