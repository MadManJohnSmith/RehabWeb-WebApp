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
        data: { title: 'Tablero de control' },
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./pages/patients/patients-list-page.component').then((m) => m.PatientsListPageComponent),
        data: { title: 'Pacientes' },
      },
      {
        path: 'pacientes/:patientId',
        loadComponent: () =>
          import('./pages/patients/patient-detail-page.component').then((m) => m.PatientDetailPageComponent),
        data: { title: 'Perfil de paciente' },
      },
      {
        path: 'historial-sesiones',
        loadComponent: () =>
          import('./pages/sessions/session-history-page.component').then((m) => m.SessionHistoryPageComponent),
        data: { title: 'Historial de sesiones' },
      },
      {
        path: 'comparativa',
        loadComponent: () =>
          import('./pages/comparison/comparison-performance-page.component').then(
            (m) => m.ComparisonPerformancePageComponent,
          ),
        data: { title: 'Comparativa de desempeño' },
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/shared/under-construction-page.component').then((m) => m.UnderConstructionPageComponent),
        data: {
          title: 'Configuraciones',
          heading: 'Configuraciones',
          description: 'Parámetros globales y de usuario. Pendiente del servicio de administración.',
        },
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
