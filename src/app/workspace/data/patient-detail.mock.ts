/** Serie semanal 0–100 y ficha resumida (demo) — compartido entre perfil y comparativa HU-04. */
export type PatientDetailRecord = {
  id: string;
  name: string;
  condition: string;
  recoveryScore: number;
  vasPain: number;
  status: string;
  meta: number[];
  real: number[];
  joints: { label: string; score: number }[];
};

export const PATIENT_DETAIL_MOCK: Record<string, PatientDetailRecord> = {
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

export const PATIENT_DETAIL_IDS = ['p-001', 'p-002', 'p-003', 'p-004'] as const;

export type PatientDetailId = (typeof PATIENT_DETAIL_IDS)[number];
