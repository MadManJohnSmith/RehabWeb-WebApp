import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="card-header">
          <h1>Agendamiento de Citas</h1>
          <p>Calendario de disponibilidad y solicitud de citas — RF-CITA-001 y RF-CITA-002</p>
        </div>

        <div class="content">

          <!-- NAVEGACIÓN DEL MES -->
          <div class="nav-mes">
            <button class="btn-nav" (click)="mesAnterior()">‹</button>
            <h2>{{ nombreMes }} {{ anio }}</h2>
            <button class="btn-nav" (click)="mesSiguiente()">›</button>
          </div>

          <!-- CALENDARIO -->
          <div class="calendario">
            <div class="dia-header" *ngFor="let d of diasSemana">{{ d }}</div>
            <div class="dia-vacio" *ngFor="let v of vacios"></div>
            <div class="dia" *ngFor="let dia of diasDelMes"
              [class.hoy]="esHoy(dia)"
              [class.seleccionado]="diaSeleccionado === dia"
              [class.tiene-cita]="tieneCita(dia)"
              [class.disponible]="esDisponible(dia)"
              (click)="seleccionarDia(dia)">
              {{ dia }}
              <span class="punto" *ngIf="tieneCita(dia)"></span>
            </div>
          </div>

          <!-- LEYENDA -->
          <div class="leyenda">
            <span><span class="dot verde"></span> Disponible</span>
            <span><span class="dot azul"></span> Hoy</span>
            <span><span class="dot naranja"></span> Con cita</span>
            <span><span class="dot gris"></span> Seleccionado</span>
          </div>

          <!-- DETALLE DEL DÍA -->
          <section *ngIf="diaSeleccionado">
            <h2>{{ diaSeleccionado }} de {{ nombreMes }} — Citas del día</h2>

            <div class="citas-dia" *ngIf="citasDelDia.length > 0">
              <div class="cita-item" *ngFor="let c of citasDelDia">
                <div class="cita-hora">{{ c.hora }}</div>
                <div class="cita-info">
                  <strong>{{ c.paciente }}</strong>
                  <span>{{ c.tipo }}</span>
                </div>
                <span class="cita-estado" [class.confirmada]="c.estado === 'Confirmada'"
                  [class.pendiente]="c.estado === 'Pendiente'">
                  {{ c.estado }}
                </span>
              </div>
            </div>

            <p class="sin-citas" *ngIf="citasDelDia.length === 0">
              No hay citas agendadas para este día.
            </p>

            <!-- FORMULARIO NUEVA CITA -->
            <div class="nueva-cita">
              <h3>Agendar nueva cita</h3>
              <div class="grid-2">
                <div class="field">
                  <label>Paciente *</label>
                  <input type="text" [(ngModel)]="nuevaCita.paciente" name="paciente" placeholder="Nombre del paciente" />
                </div>
                <div class="field">
                  <label>Hora *</label>
                  <select [(ngModel)]="nuevaCita.hora" name="hora">
                    <option value="">Seleccionar...</option>
                    <option *ngFor="let h of horasDisponibles" [value]="h">{{ h }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Tipo de consulta *</label>
                  <select [(ngModel)]="nuevaCita.tipo" name="tipo">
                    <option value="">Seleccionar...</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Videollamada">Videollamada</option>
                    <option value="Híbrida">Híbrida</option>
                  </select>
                </div>
                <div class="field">
                  <label>Motivo (opcional)</label>
                  <input type="text" [(ngModel)]="nuevaCita.motivo" name="motivo" placeholder="Máx. 100 caracteres" maxlength="100" />
                </div>
              </div>
              <div class="actions">
                <button class="btn-primary" (click)="agendarCita()">Agendar Cita</button>
              </div>
            </div>

          </section>

          <!-- PRÓXIMAS CITAS -->
          <section>
            <h2>Próximas Citas</h2>
            <div class="citas-dia">
              <div class="cita-item" *ngFor="let c of todasLasCitas">
                <div class="cita-hora">{{ c.dia }}/{{ mes + 1 }}<br><small>{{ c.hora }}</small></div>
                <div class="cita-info">
                  <strong>{{ c.paciente }}</strong>
                  <span>{{ c.tipo }}</span>
                </div>
                <span class="cita-estado" [class.confirmada]="c.estado === 'Confirmada'"
                  [class.pendiente]="c.estado === 'Pendiente'">
                  {{ c.estado }}
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }

    .page {
      min-height: 100dvh;
      background: #F8FAFC;
      padding: 2rem 1rem;
      font-family: 'Inter', sans-serif;
    }

    .card {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.10);
      overflow: hidden;
    }

    .card-header {
      background: #00A781;
      color: white;
      padding: 2rem;
    }

    .card-header h1 { margin: 0 0 0.5rem; font-size: 24px; font-weight: 700; }
    .card-header p { margin: 0; font-size: 14px; opacity: 0.9; }

    .content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .nav-mes {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }

    .nav-mes h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1A2B3E; }

    .btn-nav {
      background: #E6F6F2;
      border: none;
      color: #00A781;
      font-size: 20px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-weight: bold;
      transition: background 200ms;
    }

    .btn-nav:hover { background: #00A781; color: white; }

    .calendario {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .dia-header {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #707E8C;
      padding: 0.5rem;
    }

    .dia-vacio { height: 44px; }

    .dia {
      position: relative;
      text-align: center;
      padding: 0.6rem 0.25rem;
      border-radius: 8px;
      font-size: 14px;
      color: #1A2B3E;
      cursor: pointer;
      transition: background 200ms;
      border: 1px solid transparent;
    }

    .dia:hover { background: #E6F6F2; }
    .dia.hoy { background: #E6F6F2; border-color: #00A781; font-weight: 700; color: #00A781; }
    .dia.seleccionado { background: #00A781; color: white; font-weight: 700; }
    .dia.tiene-cita { border-color: #FFB84D; }
    .dia.disponible { background: #F0FDF9; }

    .punto {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 5px;
      height: 5px;
      background: #FFB84D;
      border-radius: 50%;
    }

    .leyenda {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      font-size: 12px;
      color: #707E8C;
    }

    .leyenda span { display: flex; align-items: center; gap: 0.4rem; }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot.verde { background: #00A781; }
    .dot.azul { background: #E6F6F2; border: 2px solid #00A781; }
    .dot.naranja { background: #FFB84D; }
    .dot.gris { background: #1A2B3E; }

    section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    section h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1A2B3E;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #E6F6F2;
    }

    section h3 { margin: 0; font-size: 15px; color: #1A2B3E; }

    .citas-dia {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .cita-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: #F8FAFC;
      border-radius: 8px;
      border-left: 3px solid #00A781;
    }

    .cita-hora {
      font-size: 13px;
      font-weight: 600;
      color: #00A781;
      min-width: 50px;
      text-align: center;
    }

    .cita-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .cita-info strong { font-size: 14px; color: #1A2B3E; }
    .cita-info span { font-size: 12px; color: #707E8C; }

    .cita-estado {
      font-size: 12px;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }

    .cita-estado.confirmada { background: #E6F6F2; color: #00A781; }
    .cita-estado.pendiente { background: #FFF8EC; color: #B45309; }

    .sin-citas { font-size: 14px; color: #707E8C; margin: 0; }

    .nueva-cita {
      background: #F8FAFC;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 14px; font-weight: 500; color: #1A2B3E; }

    input, select {
      padding: 0.6rem 0.8rem;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      color: #1A2B3E;
      background: #fff;
      transition: border 200ms;
      width: 100%;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #00A781;
      box-shadow: 0 0 0 2px rgba(0,167,129,0.15);
    }

    .actions { display: flex; justify-content: flex-end; }

    .btn-primary {
      background: #00A781;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 200ms;
    }

    .btn-primary:hover { background: #009470; }

    @media (max-width: 600px) {
      .grid-2 { grid-template-columns: 1fr; }
      .leyenda { gap: 0.75rem; }
    }
  `]
})
export class CalendarioComponent {
  hoy = new Date();
  mes = this.hoy.getMonth();
  anio = this.hoy.getFullYear();
  diaSeleccionado: number | null = null;

  nombresMes = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  horasDisponibles = ['08:00','09:00','10:00','11:00','12:00',
    '13:00','15:00','16:00','17:00','18:00'];

  citas: any[] = [
    { dia: 5,  hora: '09:00', paciente: 'Ana García',    tipo: 'Presencial',   estado: 'Confirmada', motivo: '' },
    { dia: 5,  hora: '11:00', paciente: 'Luis Martínez', tipo: 'Videollamada', estado: 'Pendiente',  motivo: '' },
    { dia: 12, hora: '10:00', paciente: 'María López',   tipo: 'Presencial',   estado: 'Confirmada', motivo: '' },
    { dia: 18, hora: '16:00', paciente: 'Carlos Ruiz',   tipo: 'Videollamada', estado: 'Confirmada', motivo: '' },
  ];

  nuevaCita = { paciente: '', hora: '', tipo: '', motivo: '' };

  get nombreMes() { return this.nombresMes[this.mes]; }

  get diasDelMes() {
    const total = new Date(this.anio, this.mes + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  get vacios() {
    const primero = new Date(this.anio, this.mes, 1).getDay();
    return Array(primero).fill(0);
  }

  get todasLasCitas() { return this.citas; }

  get citasDelDia() {
    return this.citas.filter(c => c.dia === this.diaSeleccionado);
  }

  esHoy(dia: number) {
    return dia === this.hoy.getDate() &&
      this.mes === this.hoy.getMonth() &&
      this.anio === this.hoy.getFullYear();
  }

  tieneCita(dia: number) {
    return this.citas.some(c => c.dia === dia);
  }

  esDisponible(dia: number) {
    const fecha = new Date(this.anio, this.mes, dia);
    return fecha >= this.hoy && !this.tieneCita(dia);
  }

  seleccionarDia(dia: number) {
    this.diaSeleccionado = this.diaSeleccionado === dia ? null : dia;
  }

  mesAnterior() {
    if (this.mes === 0) { this.mes = 11; this.anio--; }
    else this.mes--;
    this.diaSeleccionado = null;
  }

  mesSiguiente() {
    if (this.mes === 11) { this.mes = 0; this.anio++; }
    else this.mes++;
    this.diaSeleccionado = null;
  }

  agendarCita() {
    if (!this.nuevaCita.paciente || !this.nuevaCita.hora || !this.nuevaCita.tipo) return;
    this.citas.push({
      dia: this.diaSeleccionado,
      hora: this.nuevaCita.hora,
      paciente: this.nuevaCita.paciente,
      tipo: this.nuevaCita.tipo,
      estado: 'Pendiente',
      motivo: this.nuevaCita.motivo
    });
    this.nuevaCita = { paciente: '', hora: '', tipo: '', motivo: '' };
  }
}