import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Tipos
export type Moneda = 'USD' | 'EUR' | 'CUP';

export interface Plan {
  id: number;
  nombre: string;
  alias: string;
  descripcion: string;
  precio: string;
  moneda: Moneda;
  internacional: boolean;
  visible: boolean;
  duracion: number;
  created_at: string;
  updated_at: string;
}

export interface PlanResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Plan[];
}

export interface PlanFilters {
  nombre__icontains?: string;
  descripcion__icontains?: string;
  precio__exact?: string;
  alias__icontains?: string;
  page?: number;
  page_size?: number;
  canal_id?:number
}

const url = `${environment.baseUrlV2}/plan/`;

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Lista planes con filtros y paginación
   */
  getAll(filters?: PlanFilters): Observable<PlanResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }
    
    return this.httpClient.get<PlanResponse>(url, { params });
  }

  /**
   * Obtiene un plan por ID
   */
  get(id: number): Observable<PlanResponse> {
    return this.httpClient.get<PlanResponse>(url, { params: { id: id.toString() } });
  }

  /**
   * Crea un plan nuevo
   */
  add(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Observable<Plan> {
    return this.httpClient.post<Plan>(url, plan);
  }

  /**
   * Actualiza un plan (PATCH parcial)
   */
  update(id: number, plan: Partial<Plan>): Observable<Plan> {
    return this.httpClient.patch<Plan>(`${url}${id}/`, plan);
  }

  /**
   * Elimina un plan
   */
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${url}${id}/`);
  }
}
