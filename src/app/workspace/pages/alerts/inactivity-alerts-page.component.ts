import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { INACTIVITY_ALERTS_MOCK } from '../../data/inactivity-alerts.mock';
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

  readonly filas = toSignal(this.alertsData.getAlerts(), { initialValue: INACTIVITY_ALERTS_MOCK });

  protected readonly log = signal<string[]>([]);

  readonly cronHint =
    'En producción: un Cron en el servidor revisa cada día las últimas sesiones y eleva alerta si la diferencia con hoy es mayor a 3 días.';

  motivacional(id: string): void {
    this.log.update((l) => [`Mensaje motivacional (simulado): ${id}`, ...l].slice(0, 6));
  }

  resolver(id: string): void {
    this.log.update((l) => [`Marcado resuelto (simulado): ${id}`, ...l].slice(0, 6));
  }
}
