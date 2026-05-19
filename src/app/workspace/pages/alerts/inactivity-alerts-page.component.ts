import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INACTIVITY_ALERTS_MOCK_VIEW } from '../../data/inactivity-alerts.mock';
import type { InactivityAlertsViewDto } from '../../data/inactivity-alerts.dto';
import { InactivityAlertsDataService } from '../../services/inactivity-alerts-data.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-inactivity-alerts-page',
  standalone: true,
  imports: [RouterLink, UiIconComponent],
  templateUrl: './inactivity-alerts-page.component.html',
})
export class InactivityAlertsPageComponent {
  private readonly alertsData = inject(InactivityAlertsDataService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loadState = signal<'loading' | 'ok' | 'error'>('loading');
  readonly loadError = signal<string | null>(null);
  readonly vm = signal<InactivityAlertsViewDto>(INACTIVITY_ALERTS_MOCK_VIEW);

  protected readonly log = signal<string[]>([]);

  readonly dataHint =
    'El backend calcula en vivo los pacientes vinculados sin sesión o con más de 3 días desde la última sesión (misma regla que el dashboard).';

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.loadAlerts();
    });
  }

  loadAlerts(): void {
    this.loadState.set('loading');
    this.loadError.set(null);
    this.alertsData.getAlertsView().subscribe({
      next: (data) => {
        this.vm.set(data);
        this.loadState.set('ok');
      },
      error: () => {
        this.vm.set(INACTIVITY_ALERTS_MOCK_VIEW);
        this.loadState.set('error');
        this.loadError.set(
          'No se pudieron cargar las alertas desde el API. Comprueba que el backend esté en marcha y que hayas iniciado sesión.',
        );
      },
    });
  }

  motivacional(id: string): void {
    this.log.update((l) => [`Mensaje motivacional (simulado): ${id}`, ...l].slice(0, 6));
  }

  resolver(id: string): void {
  this.vm.update((v) => ({
    ...v,
    alerts: v.alerts.filter((a) => a.alertId !== id),
    inactiveCount: Math.max(0, v.inactiveCount - 1),
  }));
  this.log.update((l) => [`✓ Alerta ${id} marcada como resuelta`, ...l].slice(0, 6));
}
}
