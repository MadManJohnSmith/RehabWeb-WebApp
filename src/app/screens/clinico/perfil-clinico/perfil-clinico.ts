import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicoService } from '../../../services/clinico.service';

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
                <span class="campo-error" *ngIf="errores.nombre">{{ errores.nombre }}</span>
              </div>
              <div class="field">
                <label>Fecha de nacimiento *</label>
                <input type="date" [(ngModel)]="perfil.fechaNacimiento" name="fechaNacimiento" required />
                <span class="campo-error" *ngIf="errores.fechaNacimiento">{{ errores.fechaNacimiento }}</span>
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
                <span class="campo-error" *ngIf="errores.diagnostico">{{ errores.diagnostico }}</span>
              </div>
              <div class="field">
                <label>Fecha del ACV *</label>
                <input type="date" [(ngModel)]="perfil.fechaACV" name="fechaACV" required />
                <span class="campo-error" *ngIf="errores.fechaACV">{{ errores.fechaACV }}</span>
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
          <!-- NOTAS ADICIONALES -->
          <section>
            <h2>Notas Adicionales</h2>
            <div class="field">
              <label>Notas del terapeuta</label>
              <textarea [(ngModel)]="perfil.notasAdicionales" name="notasAdicionales" 
                rows="4" placeholder="Agregue cualquier nota clínica relevante del paciente..."></textarea>
            </div>
          </section>
          <!-- CONTACTO DE EMERGENCIA -->
          <!-- FAMILIAR RESPONSABLE -->
          <section>
            <h2>Familiar / Tutor Responsable</h2>
            <div class="grid-2">
              <div class="field">
                <label>Nombre del familiar *</label>
                <input type="text" [(ngModel)]="perfil.familiarNombre" name="familiarNombre" placeholder="Nombre completo" required />
                <span class="campo-error" *ngIf="errores.familiarNombre">{{ errores.familiarNombre }}</span>
              </div>
              <div class="field">
                <label>Parentesco *</label>
                <select [(ngModel)]="perfil.familiarParentesco" name="familiarParentesco" required>
                  <option value="">Seleccionar...</option>
                  <option value="Cónyuge">Cónyuge</option>
                  <option value="Hijo/a">Hijo/a</option>
                  <option value="Padre/Madre">Padre/Madre</option>
                  <option value="Hermano/a">Hermano/a</option>
                  <option value="Tutor legal">Tutor legal</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div class="field">
                <label>Teléfono de emergencia *</label>
                <input type="tel" [(ngModel)]="perfil.familiarTel" name="familiarTel" placeholder="Ej. 55 1234 5678" required />
                <span class="campo-error" *ngIf="errores.familiarTel">{{ errores.familiarTel }}</span>

              </div>
              <div class="field">
                <label>Clínica principal</label>
                <input type="text" [(ngModel)]="perfil.clinica" name="clinica" placeholder="Nombre de la clínica u hospital" />
              </div>
            </div>
          </section>

          <!-- CONSENTIMIENTO -->
          <section>
            <h2>Consentimiento Informado</h2>
            <div class="consentimiento">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="perfil.consentimiento" name="consentimiento" required />
                <span>Acepto el <strong>Aviso de Privacidad</strong> y el manejo de mis datos sensibles conforme a la <strong>Ley General de Protección de Datos Personales</strong>. Doy mi consentimiento informado para el tratamiento de rehabilitación digital.</span>
              </label>
            </div>
          </section>

          <!-- BOTONES -->
          <div class="actions">
            <button type="button" class="btn-secondary" (click)="limpiar()">Limpiar</button>
            <button type="submit" class="btn-primary" [disabled]="cargando">
              {{ cargando ? 'Guardando...' : 'Guardar Perfil Clínico' }}
            </button>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
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

    .consentimiento {
      background: #F8FAFC;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #E2E8F0;
    }

    .checkbox-label {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      font-size: 14px;
      color: #1A2B3E;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      min-width: 18px;
      accent-color: #00A781;
      margin-top: 2px;
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
    .error {
      color: #FF5C5C;
      font-size: 14px;
      margin: 0;
    }
    .campo-error {
      color: #FF5C5C;
      font-size: 12px;
      margin-top: 2px;
    }

    @media (max-width: 600px) {
      .grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class PerfilClinicoComponent {
  private clinicoService = inject(ClinicoService);
  private cdr = inject(ChangeDetectorRef);
  
  guardado = false;
  folio = '';
  cargando = false;
  error = '';

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
    familiarNombre: '',
    familiarParentesco: '',
    familiarTel: '',
    clinica: '',
    consentimiento: false,
    notasAdicionales: ''
  };

  errores: any = {};

  validar(): boolean {
    this.errores = {};

    // Nombre
    if (!this.perfil.nombre.trim()) {
      this.errores.nombre = 'El nombre es obligatorio.';
    } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(this.perfil.nombre.trim())) {
      this.errores.nombre = 'El nombre solo puede contener letras, acentos, ñ y espacios.';
    } else if (this.perfil.nombre.trim().length < 3) {
      this.errores.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    // Fecha de nacimiento
    if (!this.perfil.fechaNacimiento) {
      this.errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    } else {
      const hoy = new Date();
      const nacimiento = new Date(this.perfil.fechaNacimiento);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      if (nacimiento >= hoy) {
        this.errores.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a hoy.';
      } else if (edad > 120) {
        this.errores.fechaNacimiento = 'Fecha de nacimiento no válida.';
      }
    }

    // Sexo
    if (!this.perfil.sexo) {
      this.errores.sexo = 'El sexo es obligatorio.';
    }

    // Ubicación
    if (!this.perfil.ubicacion.trim()) {
      this.errores.ubicacion = 'La ubicación es obligatoria.';
    } else if (this.perfil.ubicacion.trim().length < 3) {
      this.errores.ubicacion = 'La ubicación debe tener al menos 3 caracteres.';
    }

    // Diagnóstico
    if (!this.perfil.diagnostico.trim()) {
      this.errores.diagnostico = 'El diagnóstico es obligatorio.';
    } else if (this.perfil.diagnostico.trim().length < 5) {
      this.errores.diagnostico = 'El diagnóstico debe tener al menos 5 caracteres.';
    }

    // Fecha ACV
    if (!this.perfil.fechaACV) {
      this.errores.fechaACV = 'La fecha del ACV es obligatoria.';
    } else {
      const hoy = new Date();
      const fechaACV = new Date(this.perfil.fechaACV);
      if (fechaACV > hoy) {
        this.errores.fechaACV = 'La fecha del ACV no puede ser futura.';
      }
    }

    // Tipo ACV
    if (!this.perfil.tipoACV) {
      this.errores.tipoACV = 'El tipo de ACV es obligatorio.';
    }

    // Nivel movilidad
    if (!this.perfil.nivelMovilidad) {
      this.errores.nivelMovilidad = 'El nivel de movilidad es obligatorio.';
    }

    // Objetivos
    if (!this.perfil.objetivos.trim()) {
      this.errores.objetivos = 'Los objetivos son obligatorios.';
    } else if (this.perfil.objetivos.trim().length < 10) {
      this.errores.objetivos = 'Los objetivos deben tener al menos 10 caracteres.';
    }

    // Familiar nombre
    if (!this.perfil.familiarNombre.trim()) {
      this.errores.familiarNombre = 'El nombre del familiar es obligatorio.';
    } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(this.perfil.familiarNombre.trim())) {
      this.errores.familiarNombre = 'El nombre solo puede contener letras, acentos, ñ y espacios.';
    } else if (this.perfil.familiarNombre.trim().length < 3) {
      this.errores.familiarNombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    // Familiar parentesco
    if (!this.perfil.familiarParentesco) {
      this.errores.familiarParentesco = 'El parentesco es obligatorio.';
    }

    // Teléfono - exactamente 10 dígitos
    if (!this.perfil.familiarTel.trim()) {
      this.errores.familiarTel = 'El teléfono es obligatorio.';
    } else if (!/^\d{10}$/.test(this.perfil.familiarTel.replace(/\s/g, ''))) {
      this.errores.familiarTel = 'El teléfono debe tener exactamente 10 dígitos.';
    }

    // Consentimiento
    if (!this.perfil.consentimiento) {
      this.errores.consentimiento = 'Debes aceptar el consentimiento informado.';
    }

    return Object.keys(this.errores).length === 0;
  }

  guardar() {
     console.log('Errores:', this.errores);
    console.log('Válido:', this.validar());
    if (!this.validar()) return;

    this.cargando = true;
    this.error = '';

    const datos = {
      nombre: this.perfil.nombre,
      fecha_nacimiento: this.perfil.fechaNacimiento,
      sexo: this.perfil.sexo,
      ubicacion: this.perfil.ubicacion,
      diagnostico: this.perfil.diagnostico,
      fecha_acv: this.perfil.fechaACV,
      tipo_acv: this.perfil.tipoACV,
      nivel_movilidad: Number(this.perfil.nivelMovilidad),
      comorbilidades: this.perfil.comorbilidades,
      medicamentos: this.perfil.medicamentos,
      historial_medico: this.perfil.historialMedico,
      restricciones: this.perfil.restricciones,
      objetivos: this.perfil.objetivos,
      familiar_nombre: this.perfil.familiarNombre,
      familiar_parentesco: this.perfil.familiarParentesco,
      familiar_tel: this.perfil.familiarTel,
      clinica: this.perfil.clinica,
      consentimiento: this.perfil.consentimiento,
      notas_adicionales: this.perfil.notasAdicionales
    };

    this.clinicoService.crearPerfil(datos).subscribe({
      next: (respuesta) => {
        this.folio = respuesta.folio || '';
        this.guardado = true;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error: ' + JSON.stringify(err.error);
        this.cargando = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  limpiar() {
    this.guardado = false;
    this.folio = '';
    this.error = '';
    this.errores = {};
    this.perfil = {
      nombre: '', fechaNacimiento: '', sexo: '', ubicacion: '',
      diagnostico: '', fechaACV: '', tipoACV: '', nivelMovilidad: '',
      comorbilidades: '', medicamentos: '', historialMedico: '',
      restricciones: '', objetivos: '', familiarNombre: '',
      familiarParentesco: '', familiarTel: '', clinica: '',
      consentimiento: false,
      notasAdicionales: ''
    };
  }
}