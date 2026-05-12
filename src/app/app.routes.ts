import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },
  { path: 'acceso', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./workspace/pages/auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./workspace/workspace.routes').then((m) => m.workspaceRoutes),
  },
  { path: 'modulo-5', redirectTo: 'app', pathMatch: 'full' },
  { path: '**', redirectTo: 'landing' },
];
