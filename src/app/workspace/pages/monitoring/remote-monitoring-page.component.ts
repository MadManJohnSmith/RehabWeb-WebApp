import { Component } from '@angular/core';

type MonitoringRow = {
  fecha: string;
  rom: string;
  dolorVas: string;
  repeticiones: string;
  fuente: 'Sistema' | 'Paciente';
  nota: string;
};

@Component({
  selector: 'app-remote-monitoring-page',
  standalone: true,
  templateUrl: './remote-monitoring-page.component.html',
})
export class RemoteMonitoringPageComponent {
  readonly paciente = 'P-10042 · Ana Silva';
  readonly scoreRecuperacion = '85.2 %';
  readonly scoreDolor = '2 / 10 (VAS)';

  readonly filas: MonitoringRow[] = [
    {
      fecha: '2026-04-14',
      rom: '68° flexión hombro',
      dolorVas: '3',
      repeticiones: '12 / 15',
      fuente: 'Sistema',
      nota: 'Cumplimiento parcial',
    },
    {
      fecha: '2026-04-13',
      rom: '64° flexión hombro',
      dolorVas: '4',
      repeticiones: '15 / 15',
      fuente: 'Paciente',
      nota: 'Autorreporte validado',
    },
    {
      fecha: '2026-04-12',
      rom: '61° flexión hombro',
      dolorVas: '5',
      repeticiones: '10 / 15',
      fuente: 'Sistema',
      nota: 'Interrupción por dolor',
    },
  ];
}
