import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicoService } from '../../../services/clinico.service';

@Component({
  selector: 'app-evaluacion-baseline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="card-header">
          <h1>Evaluación Clínica Inicial (Baseline)</h1>
          <p>Registro de evaluaciones clínicas estandarizadas — RF-CLIN-002</p>
        </div>

        <form class="form" (ngSubmit)="guardar()">
          <!-- ID DEL PERFIL -->
          <!-- BÚSQUEDA DE PACIENTE -->
          <section>
            <h2>Paciente</h2>
            <div class="grid-2">
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
            <div class="actions" style="margin-top:0.5rem; justify-content:flex-start;">
              <button type="button" class="btn-secondary" (click)="buscarPaciente()" [disabled]="cargando">
                Buscar Paciente
              </button>
            </div>
            <p class="error" *ngIf="errorBusqueda">{{ errorBusqueda }}</p>
            <div class="paciente-info" *ngIf="pacienteNombre">
              👤 <strong>{{ pacienteNombre }}</strong> encontrado correctamente.
            </div>
          </section>          <!-- MODO EDICIÓN -->
          <section>
            <h2>Editar Evaluación Existente</h2>
            <div class="grid-2">
              <div class="field">
                <label>ID de la Evaluación</label>
                <input type="text" [(ngModel)]="evaluacionId" name="evaluacionId"
                  placeholder="ID de la evaluación a editar" />
              </div>
              <div class="field" style="justify-content: flex-end;">
                <button type="button" class="btn-secondary" (click)="cargarEvaluacion()">
                  Cargar Evaluación
                </button>
              </div>
            </div>
            <div class="modo-edicion" *ngIf="modoEdicion">
              ✏️ Modo edición activo — editando evaluación: <strong>{{ evaluacionId }}</strong>
            </div>
          </section>

          <!-- FMA -->
          <section>
            <div class="section-header">
              <h2>Fugl-Meyer Assessment (FMA)</h2>
              <span class="badge">0 – 226 pts</span>
            </div>
            <p class="hint">Escala de evaluación motora post-ACV. Evaluado por el terapeuta.</p>
            <div class="grid-2">
              <div class="field">
                <label>Puntuación FMA *</label>
                <input type="number" [(ngModel)]="evaluacion.fma" name="fma"
                  min="0" max="226" placeholder="0 - 226" required />
              </div>
              <div class="field">
                <label>Nivel de función</label>
                <input type="text" [value]="nivelFMA" name="nivelFMALabel" readonly class="readonly" />
              </div>
            </div>
          </section>

          <!-- TUG -->
          <section>
            <div class="section-header">
              <h2>Timed Up and Go (TUG)</h2>
              <span class="badge">Segundos</span>
            </div>
            <p class="hint">Prueba de movilidad funcional. Mide el tiempo en levantarse, caminar 3m y regresar.</p>
            <div class="grid-2">
              <div class="field">
                <label>Tiempo TUG (segundos) *</label>
                <input type="number" [(ngModel)]="evaluacion.tug" name="tug"
                  min="0" placeholder="Ej. 12.5" step="0.1" required />
              </div>
              <div class="field">
                <label>Riesgo de caída</label>
                <input type="text" [value]="riesgoTUG" name="riesgoTUGLabel" readonly class="readonly" />
              </div>
            </div>
          </section>

          <!-- BBS -->
          <section>
            <div class="section-header">
              <h2>Berg Balance Scale (BBS)</h2>
              <span class="badge">0 – 56 pts</span>
            </div>
            <p class="hint">Escala de equilibrio funcional.</p>
            <div class="grid-2">
              <div class="field">
                <label>Puntuación BBS *</label>
                <input type="number" [(ngModel)]="evaluacion.bbs" name="bbs"
                  min="0" max="56" placeholder="0 - 56" required />
              </div>
              <div class="field">
                <label>Categoría de riesgo</label>
                <input type="text" [value]="categoriaBBS" name="categoriaBBSLabel" readonly class="readonly" />
              </div>
            </div>
          </section>

          <!-- MoCA -->
          <section>
            <div class="section-header">
              <h2>Montreal Cognitive Assessment (MoCA)</h2>
              <span class="badge">0 – 30 pts</span>
            </div>
            <p class="hint">Evaluación neurocognitiva rápida.</p>
            <div class="grid-2">
              <div class="field">
                <label>Puntuación MoCA *</label>
                <input type="number" [(ngModel)]="evaluacion.moca" name="moca"
                  min="0" max="30" placeholder="0 - 30" required />
              </div>
              <div class="field">
                <label>Nivel cognitivo</label>
                <input type="text" [value]="nivelMoCA" name="nivelMoCALabel" readonly class="readonly" />
              </div>
            </div>
          </section>

          <!-- SS-QOL -->
          <section>
            <div class="section-header">
              <h2>Stroke-Specific Quality of Life (SS-QOL)</h2>
              <span class="badge">49 ítems · Escala 1–5</span>
            </div>
            <p class="hint">Escala de calidad de vida específica para pacientes post-ACV. Ingrese el puntaje total.</p>
            <div class="grid-2">
              <div class="field">
                <label>Puntaje total SS-QOL *</label>
                <input type="number" [(ngModel)]="evaluacion.ssqol" name="ssqol"
                  min="49" max="245" placeholder="49 - 245" required />
              </div>
              <div class="field">
                <label>Perfil de calidad de vida</label>
                <input type="text" [value]="perfilSSQOL" name="perfilSSQOLLabel" readonly class="readonly" />
              </div>
            </div>
          </section>

          <!-- OBSERVACIONES -->
          <section>
            <div class="section-header">
              <h2>Observaciones del Terapeuta</h2>
            </div>
            <div class="field">
              <label>Notas cualitativas</label>
              <textarea [(ngModel)]="evaluacion.observaciones" name="observaciones"
                rows="4" placeholder="Anote observaciones relevantes del paciente durante la evaluación..."></textarea>
            </div>
          </section>

          <div class="actions">
            <button type="button" class="btn-secondary" (click)="limpiar()">Limpiar</button>
            <button type="submit" class="btn-primary" [disabled]="cargando">
              {{ cargando ? 'Guardando...' : 'Guardar Evaluación Baseline' }}
            </button>
          </div>
          <pre class="error" *ngIf="error">{{ error }}</pre>
        </form>

        <!-- CONFIRMACIÓN -->
        <div class="confirmacion" *ngIf="guardado">
          ✅ Evaluación baseline registrada correctamente.
          <div class="resumen">
            <span>FMA: <strong>{{ evaluacion.fma }} pts</strong></span>
            <span>TUG: <strong>{{ evaluacion.tug }} seg</strong></span>
            <span>BBS: <strong>{{ evaluacion.bbs }} pts</strong></span>
            <span>MoCA: <strong>{{ evaluacion.moca }} pts</strong></span>
            <span>SS-QOL: <strong>{{ evaluacion.ssqol }} pts</strong></span>
          </div>
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
      pre.error {
      white-space: pre-wrap;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      margin: 0;
    }
    .card-header {
      background: #00A781;
      color: white;
      padding: 2rem;
    }

    .card-header h1 { margin: 0 0 0.5rem; font-size: 24px; font-weight: 700; }
    .card-header p { margin: 0; font-size: 14px; opacity: 0.9; }

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

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #E6F6F2;
    }

    .section-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1A2B3E;
    }

    .badge {
      background: #E6F6F2;
      color: #00A781;
      font-size: 12px;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }
    .paciente-info {
      background: #E6F6F2;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 14px;
      color: #1A2B3E;
    }

    .hint {
      margin: 0;
      font-size: 13px;
      color: #707E8C;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
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

    input, textarea {
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

    input:focus, textarea:focus {
      outline: none;
      border-color: #00A781;
      box-shadow: 0 0 0 2px rgba(0,167,129,0.15);
    }

    .readonly {
      background: #F8FAFC;
      color: #00A781;
      font-weight: 600;
      cursor: default;
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
    }

    .btn-secondary:hover { background: #E6F6F2; }

    .confirmacion {
      margin: 0 2rem 2rem;
      padding: 1rem;
      background: #E6F6F2;
      border-radius: 8px;
      color: #1A2B3E;
      font-size: 14px;
    }
    .modo-edicion {
      background: #FFF8EC;
      color: #B45309;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 14px;
    }

    .resumen {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
    }

    .resumen span { font-size: 13px; color: #707E8C; }

    @media (max-width: 600px) {
      .grid-2 { grid-template-columns: 1fr; }
      .resumen { flex-direction: column; gap: 0.5rem; }
    }
  `]
})
export class EvaluacionBaselineComponent {
  private clinicoService = inject(ClinicoService);
  private cdr = inject(ChangeDetectorRef);

  guardado = false;
  cargando = false;
  modoEdicion = false;
  evaluacionId = '';
  error = '';
  perfilId = '';
  busquedaNombre = '';
  busquedaFecha = '';
  errorBusqueda = '';
  pacienteNombre = '';

  evaluacion = {
    fma: null as number | null,
    tug: null as number | null,
    bbs: null as number | null,
    moca: null as number | null,
    ssqol: null as number | null,
    prognosis: '',
    plan_cuidados: '',
    fecha_reevaluacion: '',
    observaciones: ''
  };

  get nivelFMA(): string {
    const v = this.evaluacion.fma;
    if (v === null) return '—';
    if (v <= 75) return 'Bajo';
    if (v <= 150) return 'Medio';
    return 'Alto';
  }

  get riesgoTUG(): string {
    const v = this.evaluacion.tug;
    if (v === null) return '—';
    if (v <= 10) return 'Bajo riesgo';
    if (v <= 20) return 'Riesgo moderado';
    return 'Alto riesgo de caída';
  }

  get categoriaBBS(): string {
    const v = this.evaluacion.bbs;
    if (v === null) return '—';
    if (v >= 41) return 'Bajo riesgo';
    if (v >= 21) return 'Riesgo moderado';
    return 'Alto riesgo';
  }

  get nivelMoCA(): string {
    const v = this.evaluacion.moca;
    if (v === null) return '—';
    if (v >= 26) return 'Normal';
    if (v >= 18) return 'Deterioro leve';
    return 'Deterioro significativo';
  }

  get perfilSSQOL(): string {
    const v = this.evaluacion.ssqol;
    if (v === null) return '—';
    if (v >= 196) return 'Buena calidad de vida';
    if (v >= 123) return 'Calidad de vida moderada';
    return 'Calidad de vida baja';
  }
  
  buscarPaciente() {
  if (!this.busquedaNombre.trim() && !this.busquedaFecha) {
    this.errorBusqueda = 'Ingresa al menos el nombre o la fecha de nacimiento.';
    return;
  }
  this.cargando = true;
  this.errorBusqueda = '';
  this.pacienteNombre = '';

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
        this.perfilId = encontrado.id;
        this.pacienteNombre = encontrado.nombre;
      } else {
        this.errorBusqueda = 'No se encontró ningún paciente con esos datos.';
      }
      this.cargando = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.errorBusqueda = 'Error al buscar paciente.';
      this.cargando = false;
      this.cdr.detectChanges();
    }
  });
}

  guardar() {
    this.cargando = true;
    this.error = '';

    const datos = {
      perfil: this.perfilId,
      fma: this.evaluacion.fma!,
      tug: this.evaluacion.tug!,
      bbs: this.evaluacion.bbs!,
      moca: this.evaluacion.moca!,
      ssqol: this.evaluacion.ssqol!,
      prognosis: this.evaluacion.prognosis,
      plan_cuidados: this.evaluacion.plan_cuidados,
      fecha_reevaluacion: this.evaluacion.fecha_reevaluacion || undefined,
      observaciones: this.evaluacion.observaciones
    };

    if (this.modoEdicion) {
      this.clinicoService.actualizarEvaluacion(this.evaluacionId, datos).subscribe({
        next: () => {
          this.guardado = true;
          this.modoEdicion = false;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Error al actualizar: ' + JSON.stringify(err.error);
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.clinicoService.crearEvaluacion(datos).subscribe({
        next: () => {
          this.guardado = true;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          const campos: Record<string, string> = {
            fma: 'FMA', tug: 'TUG', bbs: 'BBS', moca: 'MoCA', ssqol: 'SS-QOL'
          };
          const mensajes = Object.entries(err.error)
            .map(([k, v]) => `• ${campos[k] || k}: ${(v as string[]).join(', ')}`)
            .join('\n');
          this.error = 'Completa los siguientes campos antes de guardar:\n' + mensajes;
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  limpiar() {
    this.guardado = false;
    this.error = '';
    this.perfilId = '';
    this.evaluacion = {
      fma: null, tug: null, bbs: null,
      moca: null, ssqol: null, prognosis: '',
      plan_cuidados: '', fecha_reevaluacion: '',
      observaciones: ''
    };
  }
  cargarEvaluacion() {
    if (!this.evaluacionId.trim()) {
      this.error = 'Ingresa el ID de la evaluación.';
      return;
    }
    this.cargando = true;
    this.error = '';

    this.clinicoService.getEvaluaciones().subscribe({
      next: (data) => {
        const found = data.find((e: any) => e.id === this.evaluacionId);
        if (found) {
          this.evaluacion = {
            fma: found.fma,
            tug: found.tug,
            bbs: found.bbs,
            moca: found.moca,
            ssqol: found.ssqol,
            prognosis: found.prognosis || '',
            plan_cuidados: found.plan_cuidados || '',
            fecha_reevaluacion: found.fecha_reevaluacion || '',
            observaciones: found.observaciones || ''
          };
          this.perfilId = found.perfil;
          this.modoEdicion = true;
          this.cargando = false;
          this.cdr.detectChanges();
        } else {
          this.error = 'No se encontró la evaluación con ese ID.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.error = 'Error al buscar la evaluación.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}