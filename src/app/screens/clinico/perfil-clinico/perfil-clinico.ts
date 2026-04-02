import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="card-header">
          <h1>Perfil Clínico del Paciente</h1>
          <p>Complete la información clínica inicial del paciente</p>
        </div>

        <form class="form" (ngSubmit)="guardar()">

          <!-- DATOS PERSONALES -->
          <section>
            <h2>Datos Personales</h2>
            <div class="grid-2">
              <div class="field">
                <label>Nombre completo *</label>
                <input type="text" [(ngModel)]="perfil.nombre" name="nombre" placeholder="Ej. Juan García López" required />
              </div>
              <div class="field">
                <label>Fecha de nacimiento *</label>
                <input type="date" [(ngModel)]="perfil.fechaNacimiento" name="fechaNacimiento" required />
              </div>
              <div class="field">
                <label>Sexo *</label>
                <select [(ngModel)]="perfil.sexo" name="sexo" required>
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
              <div class="field">
                <label>Ubicación *</label>
                <input type="text" [(ngModel)]="perfil.ubicacion" name="ubicacion" placeholder="Ej. Ciudad de México" required />
              </div>
            </div>
          </section>

          <!-- DATOS CLÍNICOS -->
          <section>
            <h2>Datos Clínicos</h2>
            <div class="grid-2">
              <div class="field">
                <label>Diagnóstico principal *</label>
                <input type="text" [(ngModel)]="perfil.diagnostico" name="diagnostico" placeholder="Ej. Accidente Cerebrovascular territorio MCA izquierdo" required />
              </div>
              <div class="field">
                <label>Fecha del ACV *</label>
                <input type="date" [(ngModel)]="perfil.fechaACV" name="fechaACV" required />
              </div>
              <div class="field">
                <label>Tipo de ACV *</label>
                <select [(ngModel)]="perfil.tipoACV" name="tipoACV" required>
                  <option value="">Seleccionar...</option>
                  <option value="isquemico">Isquémico</option>
                  <option value="hemorragico">Hemorrágico</option>
                </select>
              </div>
              <div class="field">
                <label>Nivel de movilidad *</label>
                <select [(ngModel)]="perfil.nivelMovilidad" name="nivelMovilidad" required>
                  <option value="">Seleccionar...</option>
                  <option value="1">1 - Sin movimiento</option>
                  <option value="2">2 - Movimiento mínimo</option>
                  <option value="3">3 - Movimiento parcial</option>
                  <option value="4">4 - Casi independiente</option>
                  <option value="5">5 - Totalmente independiente</option>
                </select>
              </div>
            </div>

            <div class="grid-1">
              <div class="field">
                <label>Comorbilidades</label>
                <input type="text" [(ngModel)]="perfil.comorbilidades" name="comorbilidades" placeholder="Ej. Hipertensión, Diabetes" />
              </div>
              <div class="field">
                <label>Medicamentos actuales</label>
                <input type="text" [(ngModel)]="perfil.medicamentos" name="medicamentos" placeholder="Ej. Aspirina 100mg, Atorvastatina 20mg" />
              </div>
              <div class="field">
                <label>Historial médico</label>
                <textarea [(ngModel)]="perfil.historialMedico" name="historialMedico" rows="3" placeholder="Descripción extensa de la condición del paciente..."></textarea>
              </div>
              <div class="field">
                <label>Restricciones y contraindicaciones</label>
                <textarea [(ngModel)]="perfil.restricciones" name="restricciones" rows="3" placeholder="Lista de movimientos o actividades a evitar..."></textarea>
              </div>
            </div>
          </section>

          <!-- OBJETIVOS -->
          <section>
            <h2>Objetivos de Rehabilitación</h2>
            <div class="field">
              <label>Objetivos del paciente y terapeuta *</label>
              <textarea [(ngModel)]="perfil.objetivos" name="objetivos" rows="3" placeholder="Describa los objetivos terapéuticos..." required></textarea>
            </div>
          </section>

          <!-- CONTACTO DE EMERGENCIA -->
          <section>
            <h2>Contacto de Emergencia</h2>
            <div class="grid-2">
              <div class="field">
                <label>Nombre del contacto *</label>
                <input type="text" [(ngModel)]="perfil.contactoNombre" name="contactoNombre" placeholder="Nombre completo" required />
              </div>
              <div class="field">
                <label>Teléfono *</label>
                <input type="tel" [(ngModel)]="perfil.contactoTel" name="contactoTel" placeholder="Ej. 55 1234 5678" required />
              </div>
              <div class="field">
                <label>Clínica principal</label>
                <input type="text" [(ngModel)]="perfil.clinica" name="clinica" placeholder="Nombre de la clínica u hospital" />
              </div>
            </div>
          </section>

          <!-- BOTONES -->
          <div class="actions">
            <button type="button" class="btn-secondary" (click)="limpiar()">Limpiar</button>
            <button type="submit" class="btn-primary">Guardar Perfil Clínico</button>
          </div>

        </form>

        <!-- CONFIRMACIÓN -->
        <div class="confirmacion" *ngIf="guardado">
          ✅ Perfil clínico guardado correctamente. Folio: <strong>{{ folio }}</strong>
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

    .card-header h1 {
      margin: 0 0 0.5rem;
      font-size: 24px;
      font-weight: 700;
    }

    .card-header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .form {
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

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .grid-1 {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    label {
      font-size: 14px;
      font-weight: 500;
      color: #1A2B3E;
    }

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

    textarea { resize: vertical; }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
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

    .btn-secondary:hover {
      background: #E6F6F2;
    }

    .confirmacion {
      margin: 0 2rem 2rem;
      padding: 1rem;
      background: #E6F6F2;
      border-radius: 8px;
      color: #1A2B3E;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      .grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class PerfilClinicoComponent {
  guardado = false;
  folio = '';

  perfil = {
    nombre: '',
    fechaNacimiento: '',
    sexo: '',
    ubicacion: '',
    diagnostico: '',
    fechaACV: '',
    tipoACV: '',
    nivelMovilidad: '',
    comorbilidades: '',
    medicamentos: '',
    historialMedico: '',
    restricciones: '',
    objetivos: '',
    contactoNombre: '',
    contactoTel: '',
    clinica: ''
  };

  guardar() {
    this.folio = 'RHB-' + Date.now().toString().slice(-6);
    this.guardado = true;
    console.log('Perfil guardado:', this.perfil);
  }

  limpiar() {
    this.guardado = false;
    this.folio = '';
    this.perfil = {
      nombre: '', fechaNacimiento: '', sexo: '', ubicacion: '',
      diagnostico: '', fechaACV: '', tipoACV: '', nivelMovilidad: '',
      comorbilidades: '', medicamentos: '', historialMedico: '',
      restricciones: '', objetivos: '', contactoNombre: '',
      contactoTel: '', clinica: ''
    };
  }
}