import { Routes } from '@angular/router';

/** Rutas del shell autenticado (área de trabajo). Prefijo URL: `/app`. */
export const workspaceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell-layout.component').then((m) => m.ShellLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
        data: { title: 'Tablero — Resumen' },
      },
      {
        path: 'alertas',
        loadComponent: () =>
          import('./pages/alerts/inactivity-alerts-page.component').then(
            (m) => m.InactivityAlertsPageComponent,
          ),
        data: { title: 'Alertas de inactividad' },
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./pages/reports/reports-page.component').then((m) => m.ReportsPageComponent),
        data: { title: 'Generación de reportes' },
      },
      {
        path: 'monitoreo',
        loadComponent: () =>
          import('./pages/monitoring/remote-monitoring-page.component').then(
            (m) => m.RemoteMonitoringPageComponent,
          ),
        data: { title: 'Monitoreo remoto' },
      },
    ],
  },
];
