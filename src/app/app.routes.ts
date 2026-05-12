import { Routes } from '@angular/router';

export const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'landing' },

  {
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },

  { path: '**', redirectTo: 'landing' },

];