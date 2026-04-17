import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [FormsModule, UiIconComponent],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent {
  private readonly toast = inject(ToastService);

  pacienteId = 'p-001';
  desde = '2026-01-01';
  hasta = '2026-04-16';
  protected readonly estado = signal<string>('');

  readonly patientOptions = [
    { id: 'p-001', label: 'James Thornton' },
    { id: 'p-002', label: 'María Santos' },
    { id: 'p-003', label: 'Lucía Fernández' },
    { id: 'p-004', label: 'Carlos Méndez' },
  ];

  export(kind: 'excel' | 'pdf'): void {
    const label = kind === 'excel' ? 'Excel' : 'PDF';
    this.estado.set(`Solicitud ${label} registrada en la interfaz (sin archivo generado).`);
    this.toast.show(
      kind === 'excel'
        ? 'Exportación a Excel: cuando exista el servicio, aquí se iniciará la descarga.'
        : 'Exportación a PDF: se usará la plantilla clínica y la cola de generación en el servidor.',
    );
  }
}
