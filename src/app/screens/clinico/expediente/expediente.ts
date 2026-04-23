import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicoService } from '../../../services/clinico.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-expediente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="card-header">
          <h1>Expediente Clínico Digital</h1>
          <p>Exportación de expediente conforme a NOM-004-SSA3-2012 — RF-CLIN-004</p>
        </div>

        <div class="content">

          <!-- BUSCAR PERFIL -->
          <section>
            <h2>Buscar Paciente</h2>
            <div class="grid-2">
              <div class="field">
                <label>ID del Perfil Clínico *</label>
                <input type="text" [(ngModel)]="perfilId" name="perfilId"
                  placeholder="Ej. 8b95d6b5-507d-4406-8c96-6ca3670aadb9" />
              </div>
              <div class="field" style="justify-content: flex-end;">
                <button class="btn-primary" (click)="buscarPerfil()" [disabled]="cargando">
                  {{ cargando ? 'Buscando...' : 'Buscar Paciente' }}
                </button>
              </div>
            </div>
            <p class="error" *ngIf="error">{{ error }}</p>
          </section>

          <!-- DATOS DEL PACIENTE -->
          <section *ngIf="perfil">
            <h2>Datos del Paciente</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Folio</span>
                <span class="info-value">{{ perfil.folio }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nombre</span>
                <span class="info-value">{{ perfil.nombre }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha de nacimiento</span>
                <span class="info-value">{{ perfil.fecha_nacimiento }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Sexo</span>
                <span class="info-value">{{ perfil.sexo === 'M' ? 'Masculino' : perfil.sexo === 'F' ? 'Femenino' : 'Otro' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Diagnóstico</span>
                <span class="info-value">{{ perfil.diagnostico }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tipo de ACV</span>
                <span class="info-value">{{ perfil.tipo_acv }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nivel de movilidad</span>
                <span class="info-value">{{ perfil.nivel_movilidad }}/5</span>
              </div>
              <div class="info-item">
                <span class="info-label">Familiar responsable</span>
                <span class="info-value">{{ perfil.familiar_nombre }} ({{ perfil.familiar_parentesco }})</span>
              </div>
            </div>

            <!-- EVALUACIONES -->
            <div class="evaluaciones" *ngIf="evaluaciones.length > 0">
              <h3>Evaluaciones Clínicas</h3>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>FMA</th>
                    <th>TUG</th>
                    <th>BBS</th>
                    <th>MoCA</th>
                    <th>SS-QOL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let e of evaluaciones">
                    <td>{{ e.created_at | date:'dd/MM/yyyy' }}</td>
                    <td>{{ e.fma }}</td>
                    <td>{{ e.tug }}</td>
                    <td>{{ e.bbs }}</td>
                    <td>{{ e.moca }}</td>
                    <td>{{ e.ssqol }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- BOTONES EXPORTAR -->
            <div class="export-buttons">
              <button class="btn-primary" (click)="exportarPDF()">
                📄 Exportar PDF (NOM-004)
              </button>
              <button class="btn-secondary" (click)="imprimirExpediente()">
                🖨️ Imprimir
              </button>
            </div>

            <!-- NOTA NOM -->
            <div class="nom-badge">
              <span>📋 Expediente Digital — NOM-004-SSA3-2012</span>
              <span>Folio: {{ perfil.folio }}</span>
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

    section h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #1A2B3E;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      align-items: end;
    }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 14px; font-weight: 500; color: #1A2B3E; }

    input {
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

    input:focus {
      outline: none;
      border-color: #00A781;
      box-shadow: 0 0 0 2px rgba(0,167,129,0.15);
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.75rem;
      background: #F8FAFC;
      border-radius: 8px;
    }

    .info-label { font-size: 12px; color: #707E8C; font-weight: 500; }
    .info-value { font-size: 14px; color: #1A2B3E; font-weight: 600; }

    .evaluaciones { display: flex; flex-direction: column; gap: 0.75rem; }

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

    .export-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
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

    .btn-secondary {
      background: transparent;
      color: #00A781;
      border: 1px solid #00A781;
      padding: 0.75rem 1.5rem;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 200ms;
    }

    .btn-secondary:hover { background: #E6F6F2; }

    .nom-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #E6F6F2;
      border-radius: 8px;
      font-size: 13px;
      color: #00A781;
      font-weight: 600;
    }

    .error { color: #FF5C5C; font-size: 14px; margin: 0; }

    @media (max-width: 600px) {
      .grid-2, .info-grid { grid-template-columns: 1fr; }
    }
    @media print {
      .card-header p,
      .export-buttons,
      .field,
      label,
      input,
      .btn-primary,
      .btn-secondary,
      section:first-child {
        display: none !important;
      }

      .page {
        padding: 0;
        background: white;
      }

      .card {
        box-shadow: none;
        border-radius: 0;
      }
    }
  `]
})
export class ExpedienteComponent {
  private clinicoService = inject(ClinicoService);
  private cdr = inject(ChangeDetectorRef);

  perfilId = '';
  perfil: any = null;
  evaluaciones: any[] = [];
  cargando = false;
  error = '';

  buscarPerfil() {
    if (!this.perfilId.trim()) {
      this.error = 'Ingresa el ID del perfil.';
      return;
    }
    this.cargando = true;
    this.error = '';

    this.clinicoService.getPerfil(this.perfilId).subscribe({
      next: (data) => {
        this.perfil = data;
        this.evaluaciones = (data as any).evaluaciones || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se encontró el perfil. Verifica el ID.';
        this.cargando = false;
        this.perfil = null;
        this.cdr.detectChanges();
      }
    });
  }

  exportarPDF() {
    const doc = new jsPDF();
    const p = this.perfil;

    // Header
    doc.setFillColor(0, 167, 129);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPEDIENTE CLÍNICO DIGITAL', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RehabWeb — Plataforma de Rehabilitación Digital', 14, 22);
    doc.text(`NOM-004-SSA3-2012 | Folio: ${p.folio}`, 14, 29);

    // Datos del paciente
    doc.setTextColor(26, 43, 62);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL PACIENTE', 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [['Campo', 'Valor']],
      body: [
        ['Nombre completo', p.nombre],
        ['Fecha de nacimiento', p.fecha_nacimiento],
        ['Sexo', p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'Otro'],
        ['Ubicación', p.ubicacion],
        ['Diagnóstico principal', p.diagnostico],
        ['Fecha del ACV', p.fecha_acv],
        ['Tipo de ACV', p.tipo_acv],
        ['Nivel de movilidad', `${p.nivel_movilidad}/5`],
        ['Comorbilidades', p.comorbilidades || 'N/A'],
        ['Medicamentos', p.medicamentos || 'N/A'],
        ['Restricciones', p.restricciones || 'N/A'],
        ['Objetivos', p.objetivos],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 167, 129] },
    });

    // Familiar responsable
    const y1 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('FAMILIAR / TUTOR RESPONSABLE', 14, y1);

    autoTable(doc, {
      startY: y1 + 4,
      head: [['Campo', 'Valor']],
      body: [
        ['Nombre', p.familiar_nombre],
        ['Parentesco', p.familiar_parentesco],
        ['Teléfono', p.familiar_tel],
        ['Clínica', p.clinica || 'N/A'],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 167, 129] },
    });

    // Evaluaciones
    if (this.evaluaciones.length > 0) {
      const y2 = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('EVALUACIONES CLÍNICAS', 14, y2);

      autoTable(doc, {
        startY: y2 + 4,
        head: [['Fecha', 'FMA', 'TUG (seg)', 'BBS', 'MoCA', 'SS-QOL', 'Observaciones']],
        body: this.evaluaciones.map(e => [
          new Date(e.created_at).toLocaleDateString('es-MX'),
          e.fma, e.tug, e.bbs, e.moca, e.ssqol,
          e.observaciones || 'N/A'
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 167, 129] },
      });
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(112, 126, 140);
      doc.text(
        `Expediente generado por RehabWeb | NOM-004-SSA3-2012 | Página ${i} de ${pageCount}`,
        14, 290
      );
    }

    doc.save(`expediente-${p.folio}-${p.nombre.replace(/ /g, '_')}.pdf`);
  }

  imprimirExpediente() {
    window.print();
  }
}