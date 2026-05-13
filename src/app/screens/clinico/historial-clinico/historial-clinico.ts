import { ChangeDetectorRef, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicoService } from '../../../services/clinico.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

          <!-- BÚSQUEDA -->
          <section>
            <h2>Buscar Paciente</h2>
            <div class="filtros">
              <div class="field">
                <label>Nombre del paciente</label>
                <input type="text" [(ngModel)]="busquedaNombre" name="busquedaNombre"
                  placeholder="Nombre o apellido..." />
              </div>
              <div class="field">
                <label>Fecha de nacimiento</label>
                <input type="date" [(ngModel)]="busquedaFecha" name="busquedaFecha" />
              </div>
            </div>
            <div class="actions" style="margin-top: 0.5rem;">
              <!-- FIX: cargando() con paréntesis -->
              <button class="btn-primary" (click)="buscarPaciente()" [disabled]="cargando()">
                {{ cargando() ? 'Buscando...' : 'Buscar Paciente' }}
              </button>
            </div>
            <!-- FIX: error() con paréntesis -->
            <p class="error" *ngIf="error()">{{ error() }}</p>
          </section>

          <!-- INFO PACIENTE -->
          <!-- FIX: pacienteEncontrado() con paréntesis en todos los bindings -->
          <div class="paciente-info" *ngIf="pacienteEncontrado()">
            <span>👤 <strong>{{ pacienteEncontrado()?.nombre }}</strong></span>
            <span>📅 {{ pacienteEncontrado()?.fecha_nacimiento }}</span>
            <span>🏥 {{ pacienteEncontrado()?.diagnostico }}</span>
          </div>

          <!-- GRÁFICO DE TENDENCIA -->
          <section>
            <h2>Evolución FMA — Últimas evaluaciones</h2>
            <div class="grafico">
              <div class="barras">
                <!-- FIX: usar evaluacionesFiltradas() con paréntesis (ahora es computed signal) -->
                <div class="barra-wrap" *ngFor="let e of evaluacionesFiltradas()">
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
                      <th>ID</th>
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
                <tr *ngFor="let e of evaluacionesFiltradas(); let i = index">                  
                  <td>
                    <span class="id-badge" (click)="copiarID(e.id)" title="Click para copiar">
                      {{ e.id?.slice(0,8) }}...
                    </span>
                  </td>
                  <td>{{ e.fecha }}</td>
                  <td>{{ e.fma }}</td>
                  <td>{{ e.tug }}</td>
                  <td>{{ e.bbs }}</td>
                  <td>{{ e.moca }}</td>
                  <td>{{ e.ssqol }}</td>
                  <td>
                    <span class="tendencia"
                      [class.positiva]="i > 0 && e.fma > evaluacionesFiltradas()[i-1].fma"
                      [class.negativa]="i > 0 && e.fma < evaluacionesFiltradas()[i-1].fma"
                      [class.neutral]="i === 0 || e.fma === evaluacionesFiltradas()[i-1].fma">
                      {{ i === 0 ? '—' : (e.fma > evaluacionesFiltradas()[i-1].fma ? '↑ Mejora' : e.fma < evaluacionesFiltradas()[i-1].fma ? '↓ Deterioro' : '→ Estable') }}
                    </span>
                  </td>
                  <td class="notas">{{ e.notas }}</td>
                </tr>
              </tbody>
              </table>
            </div>
          </section>

          <!-- ALERTAS -->
          <!-- FIX: alertas() con paréntesis -->
          <section *ngIf="alertas().length > 0">
            <h2>Alertas Clínicas</h2>
            <div class="alerta" *ngFor="let a of alertas()"
              [class.alerta-roja]="a.tipo === 'danger'"
              [class.alerta-amarilla]="a.tipo === 'warning'">
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

          <!-- EXPORTAR REPORTE -->
          <section>
            <h2>Exportar Reporte</h2>
            <div class="actions">
              <button class="btn-primary" (click)="exportarReporte()">
                📄 Exportar Reporte PDF
              </button>
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
    .id-badge {
      font-size: 11px;
      background: #E6F6F2;
      color: #00A781;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: monospace;
    }

    .id-badge:hover { background: #00A781; color: white; }

    .card-header h1 { margin: 0 0 0.5rem; font-size: 24px; font-weight: 700; }
    .card-header p { margin: 0; font-size: 14px; opacity: 0.9; }

    .content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .paciente-info {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      background: #E6F6F2;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 14px;
      color: #1A2B3E;
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

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
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

    .tabla-wrap { overflow-x: auto; }

    table { width: 100%; border-collapse: collapse; font-size: 14px; }

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
    .btn-primary:disabled { background: #7ECDB8; cursor: not-allowed; }

    .error { color: #FF5C5C; font-size: 14px; margin: 0; }

    textarea { resize: vertical; }

    @media (max-width: 600px) {
      .filtros { grid-template-columns: 1fr; }
    }
  `]
})
export class HistorialClinicoComponent implements OnInit {
  private clinicoService = inject(ClinicoService);

  busquedaNombre = '';
  busquedaFecha = '';
  nuevaNota = '';

  cargando = signal(false);
  error = signal('');
  pacienteEncontrado = signal<any>(null);
  evaluaciones = signal<any[]>([]);

  // FIX: computed signal en vez de getter — se actualiza reactivamente con las señales
  evaluacionesFiltradas = computed(() => this.evaluaciones());

  // FIX: computed signal en vez de getter — antes era un getter normal que no era reactivo
  alertas = computed(() => {
    const lista = this.evaluaciones();
    const ultima = lista[lista.length - 1];
    const penultima = lista[lista.length - 2];
    const alertas: { tipo: string; mensaje: string }[] = [];

    if (ultima && penultima && (ultima.fma - penultima.fma) < -5) {
      alertas.push({ tipo: 'danger', mensaje: 'Deterioro significativo en FMA: descenso de más de 5 puntos.' });
    }
    if (ultima && ultima.bbs < 21) {
      alertas.push({ tipo: 'danger', mensaje: 'Alto riesgo de caída: BBS menor a 21 puntos.' });
    }
    if (ultima && ultima.moca < 18) {
      alertas.push({ tipo: 'warning', mensaje: 'Deterioro cognitivo detectado: MoCA menor a 18 puntos.' });
    }
    return alertas;
  });

  ngOnInit() {}

  buscarPaciente() {
    if (!this.busquedaNombre.trim() && !this.busquedaFecha) {
      this.error.set('Ingresa al menos el nombre o la fecha de nacimiento.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    // FIX: limpiar resultados anteriores antes de buscar
    this.pacienteEncontrado.set(null);
    this.evaluaciones.set([]);

    this.clinicoService.getPerfiles().subscribe({
      next: (data: any[]) => {
        const encontrado = data.find((p: any) => {
          const nombreMatch = this.busquedaNombre.trim()
            ? p.nombre.toLowerCase().includes(this.busquedaNombre.toLowerCase().trim())
            : true;
          const fechaMatch = this.busquedaFecha
            ? p.fecha_nacimiento === this.busquedaFecha
            : true;
          return nombreMatch && fechaMatch;
        });

        if (encontrado) {
          this.pacienteEncontrado.set(encontrado);
          this.evaluaciones.set((encontrado.evaluaciones || []).map((e: any) => {
  console.log('Evaluación completa:', e);
  return {
    id: e.id,
    fecha: new Date(e.created_at).toLocaleDateString('es-MX'),
    fma: e.fma, tug: e.tug, bbs: e.bbs,
    moca: e.moca, ssqol: e.ssqol,
    notas: e.observaciones || ''
  };
}).reverse());
        } else {
          this.error.set('No se encontró ningún paciente con esos datos.');
        }

        // FIX: siempre se ejecuta, dentro del next
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al buscar paciente:', err);
        this.error.set('Error al buscar paciente. Intenta de nuevo.');
        // FIX: también se resetea en el error
        this.cargando.set(false);
      }
    });
  }
  copiarID(id: string) {
    navigator.clipboard.writeText(id);
    alert('ID copiado: ' + id);
  }

  agregarNota() {
    if (!this.nuevaNota.trim()) return;

    const hoy = new Date().toLocaleDateString('es-MX');
    const lista = this.evaluaciones();
    const ultima = lista[lista.length - 1];

    this.evaluaciones.update(list => [...list, {
      fecha: hoy,
      fma: ultima?.fma || 0,
      tug: ultima?.tug || 0,
      bbs: ultima?.bbs || 0,
      moca: ultima?.moca || 0,
      ssqol: ultima?.ssqol || 0,
      notas: this.nuevaNota
    }]);

    this.nuevaNota = '';
  }

  exportarReporte() {
    const doc = new jsPDF();

    doc.setFillColor(0, 167, 129);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE HISTORIAL CLÍNICO', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RehabWeb — Plataforma de Rehabilitación Digital', 14, 22);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 29);

    const paciente = this.pacienteEncontrado();
    if (paciente) {
      doc.setTextColor(26, 43, 62);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Paciente: ${paciente.nombre}`, 14, 48);
    }

    doc.setTextColor(26, 43, 62);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRO DE EVALUACIONES', 14, 56);

    const evs = this.evaluaciones();
    autoTable(doc, {
      startY: 60,
      head: [['Fecha', 'FMA', 'TUG (seg)', 'BBS', 'MoCA', 'SS-QOL', 'Tendencia', 'Notas']],
      body: evs.map((e, i, arr) => [
        e.fecha, e.fma, e.tug, e.bbs, e.moca, e.ssqol,
        i === 0 ? '—' : e.fma > arr[i - 1].fma ? '↑ Mejora' : e.fma < arr[i - 1].fma ? '↓ Deterioro' : '→ Estable',
        e.notas || 'N/A'
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 167, 129] },
    });

    doc.setFontSize(8);
    doc.setTextColor(112, 126, 140);
    doc.text('Reporte generado por RehabWeb | NOM-004-SSA3-2012', 14, 290);
    doc.save(`reporte-historial-${new Date().toLocaleDateString('es-MX')}.pdf`);
  }
}