import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

export type PatientRow = {
  id: string;
  name: string;
  condition: string;
  lastSession: string;
};

@Component({
  selector: 'app-patients-list-page',
  standalone: true,
  imports: [RouterLink, UiIconComponent],
  templateUrl: './patients-list-page.component.html',
})
export class PatientsListPageComponent {
  readonly patients: PatientRow[] = [
    { id: 'p-001', name: 'James Thornton', condition: 'Hombro postoperatorio', lastSession: '2026-04-09' },
    { id: 'p-002', name: 'María Santos', condition: 'Rodilla — ACL', lastSession: '2026-04-11' },
    { id: 'p-003', name: 'Lucía Fernández', condition: 'Tobillo — esguince', lastSession: '2026-04-14' },
    { id: 'p-004', name: 'Carlos Méndez', condition: 'Lumbar — rehabilitación', lastSession: '2026-04-15' },
  ];
}
