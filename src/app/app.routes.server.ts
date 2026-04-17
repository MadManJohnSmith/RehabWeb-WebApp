import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'app/pacientes/:patientId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ patientId: 'p-001' }, { patientId: 'p-002' }, { patientId: 'p-003' }, { patientId: 'p-004' }];
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
