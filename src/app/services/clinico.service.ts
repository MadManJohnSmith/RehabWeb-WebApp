import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://127.0.0.1:8000/api';

export interface PerfilClinico {
  id?: string;
  folio?: string;
  nombre: string;
  fecha_nacimiento: string;
  sexo: string;
  ubicacion: string;
  diagnostico: string;
  fecha_acv: string;
  tipo_acv: string;
  nivel_movilidad: number;
  comorbilidades?: string;
  medicamentos?: string;
  historial_medico?: string;
  restricciones?: string;
  objetivos: string;
  familiar_nombre: string;
  familiar_parentesco: string;
  familiar_tel: string;
  clinica?: string;
  consentimiento: boolean;
}

export interface EvaluacionBaseline {
  id?: string;
  perfil: string;
  fma: number;
  tug: number;
  bbs: number;
  moca: number;
  ssqol: number;
  prognosis?: string;
  plan_cuidados?: string;
  fecha_reevaluacion?: string;
  observaciones?: string;
}

export interface Cita {
  id?: string;
  perfil: string;
  fecha: string;
  hora: string;
  tipo: string;
  estado?: string;
  motivo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicoService {
  constructor(private http: HttpClient) {}

  // Perfiles Clínicos
  getPerfiles(): Observable<PerfilClinico[]> {
    return this.http.get<PerfilClinico[]>(`${API}/perfiles-clinicos/`);
  }

  getPerfil(id: string): Observable<PerfilClinico> {
    return this.http.get<PerfilClinico>(`${API}/perfiles-clinicos/${id}/`);
  }

  crearPerfil(perfil: PerfilClinico): Observable<PerfilClinico> {
    return this.http.post<PerfilClinico>(`${API}/perfiles-clinicos/`, perfil);
  }

  actualizarPerfil(id: string, perfil: PerfilClinico): Observable<PerfilClinico> {
    return this.http.put<PerfilClinico>(`${API}/perfiles-clinicos/${id}/`, perfil);
  }

  // Evaluaciones
  getEvaluaciones(): Observable<EvaluacionBaseline[]> {
    return this.http.get<EvaluacionBaseline[]>(`${API}/evaluaciones/`);
  }

  crearEvaluacion(evaluacion: EvaluacionBaseline): Observable<EvaluacionBaseline> {
    return this.http.post<EvaluacionBaseline>(`${API}/evaluaciones/`, evaluacion);
  }
  

  // Citas
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API}/citas/`);
  }

  crearCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${API}/citas/`, cita);
  }

  actualizarCita(id: string, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${API}/citas/${id}/`, cita);
  }
  
  eliminarCita(id: string): Observable<any> {
    return this.http.delete(`${API}/citas/${id}/`);
  }
  actualizarEvaluacion(id: string, evaluacion: any): Observable<any> {
    return this.http.put<any>(`${API}/evaluaciones/${id}/`, evaluacion);
  } 
}