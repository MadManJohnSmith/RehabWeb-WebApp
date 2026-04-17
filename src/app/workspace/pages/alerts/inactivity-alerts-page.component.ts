import { Component, signal } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

type InactivityRow = {
  id: string;
  paciente: string;
  dias: number;
  prioridad: 'alta' | 'media';
};

@Component({
  selector: 'app-inactivity-alerts-page',
  standalone: true,
  imports: [UiIconComponent],
  templateUrl: './inactivity-alerts-page.component.html',
})
export class InactivityAlertsPageComponent {
  readonly filas: InactivityRow[] = [
    { id: 'A-104', paciente: 'Paciente cohorte A-104', dias: 5, prioridad: 'alta' },
    { id: 'A-088', paciente: 'Paciente cohorte A-088', dias: 4, prioridad: 'alta' },
    { id: 'B-201', paciente: 'Paciente cohorte B-201', dias: 3, prioridad: 'media' },
  ];

  protected readonly log = signal<string[]>([]);

  motivacional(id: string): void {
    this.log.update((l) => [`Mensaje motivacional (simulado): ${id}`, ...l].slice(0, 6));
  }

  resolver(id: string): void {
    this.log.update((l) => [`Marcado resuelto (simulado): ${id}`, ...l].slice(0, 6));
  }
}
