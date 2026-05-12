import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { INACTIVITY_ALERTS_MOCK_VIEW } from '../../data/inactivity-alerts.mock';
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

  readonly vm = toSignal(this.alertsData.getAlertsView(), {
    initialValue: INACTIVITY_ALERTS_MOCK_VIEW,
  });

  protected readonly log = signal<string[]>([]);

  readonly dataHint =
    'El backend calcula en vivo los pacientes vinculados sin sesión o con más de 3 días desde la última sesión (misma regla que el dashboard).';

  motivacional(id: string): void {
    this.log.update((l) => [`Mensaje motivacional (simulado): ${id}`, ...l].slice(0, 6));
  }

  resolver(id: string): void {
    this.log.update((l) => [`Marcado resuelto (simulado): ${id}`, ...l].slice(0, 6));
  }
}
