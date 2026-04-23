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
  {
    path: 'clinico/evaluacion',
    loadComponent: () =>
      import('./screens/clinico/evaluacion-baseline/evaluacion-baseline').then(
        (m) => m.EvaluacionBaselineComponent
      ),
  },
  {
    path: 'clinico/historial',
    loadComponent: () =>
      import('./screens/clinico/historial-clinico/historial-clinico').then(
        (m) => m.HistorialClinicoComponent
      ),
  },
  {
  path: 'citas/calendario',
  loadComponent: () =>
    import('./screens/citas/calendario/calendario').then(
      (m) => m.CalendarioComponent
    ),
},
{
  path: 'clinico/expediente',
  loadComponent: () =>
    import('./screens/clinico/expediente/expediente').then(
      (m) => m.ExpedienteComponent
    ),
},  

  { path: '**', redirectTo: 'landing' },


];