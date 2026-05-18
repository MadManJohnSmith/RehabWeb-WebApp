import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InactivityAlertsDataService } from '../../services/inactivity-alerts-data.service';
import type { InactivityAlertsViewDto } from '../../data/inactivity-alerts.dto';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-inactivity-alerts-page',
  standalone: true,
  imports: [RouterLink, UiIconComponent],
  templateUrl: './inactivity-alerts-page.component.html',
})
export class InactivityAlertsPageComponent implements OnInit {
  private readonly alertsData = inject(InactivityAlertsDataService);
  private readonly cd = inject(ChangeDetectorRef);

  private readonly emptyAlerts: InactivityAlertsViewDto = {
    thresholdDays: 3,
    inactiveCount: 0,
    alerts: [],
  };

  readonly vm = signal<InactivityAlertsViewDto>(this.emptyAlerts);
  readonly loadState = signal<'loading' | 'ok' | 'error'>('loading');
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.alertsData.getAlertsView().subscribe({
      next: (data) => {
        this.vm.set(data);
        this.loadState.set('ok');
        this.cd.detectChanges();
      },
      error: () => {
        this.vm.set(this.emptyAlerts);
        this.loadState.set('error');
        this.loadError.set('No se pudieron cargar las alertas desde el API. Comprueba que el backend esté en marcha.');
        this.cd.detectChanges();
      }
    });
  }

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
