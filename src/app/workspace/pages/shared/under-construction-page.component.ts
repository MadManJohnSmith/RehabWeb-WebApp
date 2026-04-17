import { afterNextRender, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-under-construction-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-lg space-y-4 px-4 py-10">
      <div
        class="rounded-card border border-pm-border bg-pm-surface p-8 text-center shadow-pm-sm dark:border-pm-border-dark dark:bg-pm-surface-dark dark:shadow-pm-sm-dark"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-pm-muted dark:text-pm-muted-dark">
          PhysioMetrics
        </p>
        <h1 class="mt-2 text-xl font-bold text-pm-ink dark:text-pm-ink-on-dark">{{ heading }}</h1>
        <p class="mt-2 text-sm text-pm-muted dark:text-pm-muted-dark">
          {{ description }}
        </p>
        <a
          routerLink="/app/dashboard"
          class="mt-6 inline-flex items-center justify-center rounded-control bg-pm-primary px-4 py-2 text-sm font-medium text-white hover:bg-pm-primary-hover"
        >
          Volver al tablero
        </a>
      </div>
    </div>
  `,
})
export class UnderConstructionPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly heading = (this.route.snapshot.data['heading'] as string) ?? 'En construcción';
  readonly description =
    (this.route.snapshot.data['description'] as string) ??
    'Este módulo se conectará al servidor cuando esté disponible.';

  constructor() {
    afterNextRender(() => {
      this.toast.show('Módulo en construcción. Pronto enlazaremos datos reales desde el servidor.');
    });
  }
}
