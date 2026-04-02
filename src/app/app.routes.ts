import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },

  // Módulo 2 - Núcleo Clínico
  {
    path: 'clinico/perfil',
    loadComponent: () =>
      import('./screens/clinico/perfil-clinico/perfil-clinico').then(
        (m) => m.PerfilClinicoComponent
      ),
  },

  { path: '**', redirectTo: 'landing' },
];