import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'app/pacientes/:patientId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ patientId: '1' }, { patientId: '2' }, { patientId: '3' }, { patientId: '4' }];
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
