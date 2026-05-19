import { Injectable, signal, computed, inject } from '@angular/core';
import { NotificacionPublicacionService } from './notificacion-publicacion.service';
import { PictaResponse } from '../models/response.picta.model';
import { Observable, BehaviorSubject, of } from 'rxjs';

export interface Notificacion {
  id: number;
  vista: boolean;
  // ... other fields
}

const STORAGE_KEY = 'notification_badge_count';
const PAGE_SIZE = 10;

@Injectable({
  providedIn: 'root',
})
export class NotificationStoreService {
  private notificacionPublicacionService = inject(NotificacionPublicacionService);

  // Signals para estado reactivo
  private _notificaciones = signal<Notificacion[]>([]);
  private _loading = signal(false);
  private _params = signal({ page: 1, page_size: PAGE_SIZE });
  
  // Observable para通知 cambios
  private _notificaciones$ = new BehaviorSubject<Notificacion[]>([]);
  
  // Badge count con soporte para localStorage
  private _badgeCount = signal(0);
  private _badgeCount$ = new BehaviorSubject<number>(0);

  // Computed values
  readonly notificaciones = this._notificaciones.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly unseenCount = computed(() =>
    this._notificaciones().filter(n => !n.vista).length
  );
  readonly hasUnseen = computed(() => this.unseenCount() > 0);
  
  // Badge display: si hay más de 10, mostrar "10+"
  readonly badgeDisplay = computed(() => {
    const count = this._badgeCount();
    return count > PAGE_SIZE ? `${PAGE_SIZE}+` : (count > 0 ? String(count) : '');
  });
  
  // Observables públicos
  readonly notificaciones$ = this._notificaciones$.asObservable();
  readonly badgeCount$ = this._badgeCount$.asObservable();

  constructor() {
    // Recover badge count from localStorage on init
    this._loadBadgeFromStorage();
  }
  
  private _loadBadgeFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const count = parseInt(stored, 10);
        if (!isNaN(count)) {
          this._badgeCount.set(count);
          this._badgeCount$.next(count);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }
  
  private _saveBadgeToStorage(count: number) {
    try {
      localStorage.setItem(STORAGE_KEY, String(count));
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Obtiene el conteo actual del badge
   */
  badgeCount(): number {
    return this._badgeCount();
  }
  
  /**
   * Incrementa el badge inmediatamente para feedback instantáneo
   */
incrementBadge() {
    const current = this._badgeCount();
    const newValue = current + 1;
    this._badgeCount.set(newValue);
    this._badgeCount$.next(newValue);
    this._saveBadgeToStorage(newValue);
  }
  
  /**
   * Retorna true si está cargando notificaciones
   */
  isLoading(): boolean {
    return this._loading();
  }
  
  /**
   * Obtiene el display del badge (puede ser "10+" si hay más de 10)
   */
  getBadgeDisplay(): string {
    const count = this._badgeCount();
    return count > PAGE_SIZE ? `${PAGE_SIZE}+` : (count > 0 ? String(count) : '');
  }

  /**
   * Carga notificaciones desde API
   */
  load(forceReload = false) {
    // Si ya tenemos datos en memoria y no forzamos reload, usar cache
    if (!forceReload && this._notificaciones().length > 0) {
      this._notificaciones$.next(this._notificaciones());
      return;
    }

    if (this._loading()) {
      return;
    }

    this._loading.set(true);
    this.notificacionPublicacionService
      .getAll({ page: 1, page_size: PAGE_SIZE })
      .subscribe({
        next: (response: PictaResponse<Notificacion>) => {
          const results = (response.results ?? []) as Notificacion[];
          this._notificaciones.set(results);
          this._notificaciones$.next(results);
          this._params.set({ page: response.next ?? 1, page_size: PAGE_SIZE });
          
          // Calcular y guardar badge
          const unseenCount = results.filter(n => !n.vista).length;
          this._badgeCount.set(unseenCount);
          this._badgeCount$.next(unseenCount);
          this._saveBadgeToStorage(unseenCount);
          
          this._loading.set(false);
        },
        error: () => {
          this._loading.set(false);
        },
      });
  }

  /**
   * Carga más notificaciones (pagination)
   */
  loadMore() {
    const currentParams = this._params();
    if (!currentParams.page || this._loading()) {
      return;
    }

    this._loading.set(true);
    this.notificacionPublicacionService
      .getAll(currentParams)
      .subscribe({
        next: (response: PictaResponse<Notificacion>) => {
          const newResults = (response.results ?? []) as Notificacion[];
          const current = this._notificaciones();
          const updated = [...current, ...newResults];
          this._notificaciones.set(updated);
          this._notificaciones$.next(updated);
          this._params.set({ page: response.next ?? 1, page_size: PAGE_SIZE });
          this._loading.set(false);
        },
        error: () => {
          this._loading.set(false);
        },
      });
  }

  /**
   * Limpia el cache - útil cuando el usuario hace logout
   */
  clear() {
    this._notificaciones.set([]);
    this._notificaciones$.next([]);
    this._params.set({ page: 1, page_size: PAGE_SIZE });
    this._badgeCount.set(0);
    this._badgeCount$.next(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * Marca notificaciones como leídas
   */
  async markAsRead(ids: string) {
    // Optimistic update - marcar como vistas localmente
    const updated = this._notificaciones().map(n =>
      ids.includes(String(n.id)) ? { ...n, vista: true } : n
    );
    this._notificaciones.set(updated);
    this._notificaciones$.next(updated);

    // Actualizar badge
    const unseenCount = updated.filter(n => !n.vista).length;
    this._badgeCount.set(unseenCount);
    this._badgeCount$.next(unseenCount);
    this._saveBadgeToStorage(unseenCount);

    // Luego hacer la petición al server
    try {
      const firstId = ids.split(',')[0];
      await this.notificacionPublicacionService
        .markAsRead(Number(firstId), ids)
        .toPromise();
    } catch {
      // Si falla, recargar del server
      this.load(true);
    }
  }
}