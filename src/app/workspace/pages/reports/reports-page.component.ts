import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [FormsModule, UiIconComponent],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent {
  pacienteId = 'P-10042';
  desde = '2026-01-01';
  hasta = '2026-04-16';
  protected readonly estado = signal<string>('');

  export(kind: 'excel' | 'pdf'): void {
    this.estado.set(`Exportación ${kind.toUpperCase()} simulada (sin archivo generado).`);
  }
}
