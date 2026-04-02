import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="card-header">
          <h1>Historial Clínico Longitudinal</h1>
          <p>Registro completo de evaluaciones y evolución clínica — RF-CLIN-003</p>
        </div>

        <div class="content">

          <!-- FILTROS -->
          <div class="filtros">
            <div class="field">
              <label>Buscar paciente</label>
              <input type="text" [(ngModel)]="busqueda" name="busqueda" placeholder="Nombre o folio..." />
            </div>
            <div class="field">
              <label>Filtrar por período</label>
              <select [(ngModel)]="periodo" name="periodo">
                <option value="todas">Todas</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
                <option value="trimestre">Últimos 3 meses</option>
              </select>
            </div>
          </div>

          <!-- GRÁFICO DE TENDENCIA -->
          <section>
            <h2>Evolución FMA — Últimas 6 evaluaciones</h2>
            <div class="grafico">
              <div class="barras">
                <div class="barra-wrap" *ngFor="let e of evaluacionesFiltradas">
                  <div class="barra" [style.height.%]="(e.fma / 226) * 100"
                    [class.mejora]="e.fma >= 150"
                    [class.regular]="e.fma >= 75 && e.fma < 150"
                    [class.bajo]="e.fma < 75">
                  </div>
                  <span class="barra-valor">{{ e.fma }}</span>
                  <span class="barra-fecha">{{ e.fecha }}</span>
                </div>
              </div>
              <div class="grafico-labels">
                <span>226</span>
                <span>150</span>
                <span>75</span>
                <span>0</span>
              </div>
            </div>
          </section>

          <!-- TABLA DE HISTORIAL -->
          <section>
            <h2>Registro de Evaluaciones</h2>
            <div class="tabla-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>FMA</th>
                    <th>TUG (seg)</th>
                    <th>BBS</th>
                    <th>MoCA</th>
                    <th>SS-QOL</th>
                    <th>Tendencia</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let e of evaluacionesFiltradas; let i = index">
                    <td>{{ e.fecha }}</td>
                    <td>{{ e.fma }}</td>
                    <td>{{ e.tug }}</td>
                    <td>{{ e.bbs }}</td>
                    <td>{{ e.moca }}</td>
                    <td>{{ e.ssqol }}</td>
                    <td>
                      <span class="tendencia"
                        [class.positiva]="i > 0 && e.fma > evaluacionesFiltradas[i-1].fma"
                        [class.negativa]="i > 0 && e.fma < evaluacionesFiltradas[i-1].fma"
                        [class.neutral]="i === 0 || e.fma === evaluacionesFiltradas[i-1].fma">
                        {{ i === 0 ? '—' : (e.fma > evaluacionesFiltradas[i-1].fma ? '↑ Mejora' : e.fma < evaluacionesFiltradas[i-1].fma ? '↓ Deterioro' : '→ Estable') }}
                      </span>
                    </td>
                    <td class="notas">{{ e.notas }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- ALERTAS -->
          <section *ngIf="alertas.length > 0">
            <h2>Alertas Clínicas</h2>
            <div class="alerta" *ngFor="let a of alertas" [class.alerta-roja]="a.tipo === 'danger'" [class.alerta-amarilla]="a.tipo === 'warning'">
              <span class="alerta-icon">{{ a.tipo === 'danger' ? '🔴' : '🟡' }}</span>
              <span>{{ a.mensaje }}</span>
            </div>
          </section>

          <!-- AGREGAR NOTA -->
          <section>
            <h2>Agregar Nota Clínica</h2>
            <div class="field">
              <label>Nota del terapeuta</label>
              <textarea [(ngModel)]="nuevaNota" name="nuevaNota" rows="3"
                placeholder="Anote cambios en diagnóstico, restricciones o eventos adversos..."></textarea>
            </div>
            <div class="actions">
              <button class="btn-primary" (click)="agregarNota()">Agregar Nota</button>
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
      max-width: 960px;
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

    .filtros {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

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

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    label { font-size: 14px; font-weight: 500; color: #1A2B3E; }

    input, select, textarea {
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

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #00A781;
      box-shadow: 0 0 0 2px rgba(0,167,129,0.15);
    }

    /* GRÁFICO */
    .grafico {
      display: flex;
      gap: 1rem;
      background: #F8FAFC;
      border-radius: 8px;
      padding: 1.5rem;
      height: 200px;
      align-items: flex-end;
    }

    .grafico-labels {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 11px;
      color: #707E8C;
      height: 100%;
    }

    .barras {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex: 1;
      height: 100%;
    }

    .barra-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      flex: 1;
      height: 100%;
      justify-content: flex-end;
    }

    .barra {
      width: 100%;
      border-radius: 4px 4px 0 0;
      min-height: 4px;
      transition: height 400ms;
    }

    .barra.mejora { background: #00A781; }
    .barra.regular { background: #FFB84D; }
    .barra.bajo { background: #FF5C5C; }

    .barra-valor { font-size: 12px; font-weight: 600; color: #1A2B3E; }
    .barra-fecha { font-size: 10px; color: #707E8C; }

    /* TABLA */
    .tabla-wrap { overflow-x: auto; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    th {
      background: #F8FAFC;
      color: #1A2B3E;
      font-weight: 600;
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 2px solid #E2E8F0;
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #E2E8F0;
      color: #1A2B3E;
    }

    tr:hover td { background: #F8FAFC; }

    .tendencia {
      font-size: 12px;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .tendencia.positiva { background: #E6F6F2; color: #00A781; }
    .tendencia.negativa { background: #FFF0F0; color: #FF5C5C; }
    .tendencia.neutral { background: #F8FAFC; color: #707E8C; }

    .notas { font-size: 12px; color: #707E8C; max-width: 200px; }

    /* ALERTAS */
    .alerta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 14px;
    }

    .alerta-roja { background: #FFF0F0; color: #FF5C5C; }
    .alerta-amarilla { background: #FFF8EC; color: #B45309; }

    .actions {
      display: flex;
      justify-content: flex-end;
    }

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

    textarea { resize: vertical; }

    @media (max-width: 600px) {
      .filtros { grid-template-columns: 1fr; }
    }
  `]
})
export class HistorialClinicoComponent {
  busqueda = '';
  periodo = 'todas';
  nuevaNota = '';

  evaluaciones = [
    { fecha: '01/01/2026', fma: 58,  tug: 28, bbs: 18, moca: 16, ssqol: 89,  notas: 'Evaluación inicial' },
    { fecha: '15/01/2026', fma: 72,  tug: 24, bbs: 22, moca: 18, ssqol: 105, notas: 'Mejora en movilidad' },
    { fecha: '01/02/2026', fma: 95,  tug: 20, bbs: 28, moca: 20, ssqol: 128, notas: 'Progreso sostenido' },
    { fecha: '15/02/2026', fma: 118, tug: 17, bbs: 33, moca: 22, ssqol: 152, notas: 'Buena adherencia' },
    { fecha: '01/03/2026', fma: 140, tug: 14, bbs: 39, moca: 24, ssqol: 174, notas: 'Recuperación notable' },
    { fecha: '15/03/2026', fma: 162, tug: 11, bbs: 44, moca: 26, ssqol: 196, notas: 'Casi independiente' },
  ];

  get evaluacionesFiltradas() {
    return this.evaluaciones;
  }

  get alertas() {
    const alertas = [];
    const ultima = this.evaluaciones[this.evaluaciones.length - 1];
    const penultima = this.evaluaciones[this.evaluaciones.length - 2];

    if (ultima && penultima && (ultima.fma - penultima.fma) < -5) {
      alertas.push({ tipo: 'danger', mensaje: 'Deterioro significativo en FMA: descenso de más de 5 puntos en las últimas 2 semanas.' });
    }

    if (ultima && ultima.bbs < 21) {
      alertas.push({ tipo: 'danger', mensaje: 'Alto riesgo de caída: BBS menor a 21 puntos.' });
    }

    if (ultima && ultima.moca < 18) {
      alertas.push({ tipo: 'warning', mensaje: 'Deterioro cognitivo detectado: MoCA menor a 18 puntos.' });
    }

    return alertas;
  }

  agregarNota() {
    if (!this.nuevaNota.trim()) return;
    const hoy = new Date().toLocaleDateString('es-MX');
    this.evaluaciones.push({
      fecha: hoy,
      fma: this.evaluaciones[this.evaluaciones.length - 1].fma,
      tug: this.evaluaciones[this.evaluaciones.length - 1].tug,
      bbs: this.evaluaciones[this.evaluaciones.length - 1].bbs,
      moca: this.evaluaciones[this.evaluaciones.length - 1].moca,
      ssqol: this.evaluaciones[this.evaluaciones.length - 1].ssqol,
      notas: this.nuevaNota
    });
    this.nuevaNota = '';
  }
}