import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

/**
 * CineModeService - Controla el modo cine para ocultar toolbar y footer
 * desde cualquier componente (especialmente PublicacionComponent)
 * 
 * Separa dos conceptos:
 * - isCineMode: estado activo actual (oculta/muestra toolbar y footer)
 * - Preferencia guardada en localStorage: recordará la elección del usuario
 * 
 * Cuando el usuario navega a otra página (no Publicacion), se desactiva el estado
 * pero se mantiene la preferencia para la próxima vez que entre a Publicacion.
 * 
 * NOTA: El modo cine solo está disponible para usuarios con suscripción activa.
 */
@Injectable({
  providedIn: 'root',
})
export class CineModeService {
  private readonly STORAGE_KEY = 'picta_cine_mode';
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  // Signal para controlar el modo cine - true = oculto toolbar y footer
  // Se inicializa en false (el componente Publicacion lo activará si hay preferencia guardada)
  readonly isCineMode = signal(false);

  /**
   * Obtener la preferencia del modo cine desde localStorage
   * (No afecta el estado activo, solo guarda la elección del usuario)
   */
  getStoredPreference(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === 'true';
  }

  /**
   * Guardar la preferencia del modo cine en localStorage
   * (El usuario quiere modo cine por defecto la próxima vez)
   */
  storePreference(value: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(this.STORAGE_KEY, String(value));
  }

  /**
   * Activar modo cine - oculta toolbar y footer
   * También guarda la preferencia en localStorage
   */
  enterCineMode() {
    this.isCineMode.set(true);
    this.storePreference(true);
  }

  /**
   * Salir del modo cine - muestra toolbar y footer
   * También guarda la preferencia (el usuario desactivó manualmente)
   */
  exitCineMode() {
    this.isCineMode.set(false);
    this.storePreference(false);
  }

  /**
   * Salir temporalmente del modo cine (para navegación)
   * Desactiva el estado activo PERO mantiene la preferencia guardada
   * para que la próxima vez que entre a Publicacion se reactive automáticamente
   */
  deactivateForNavigation() {
    this.isCineMode.set(false);
    // NOTA: No guardamos en localStorage, mantenemos la preferencia actual
  }

/**
    * Verificar si el usuario tiene una suscripción activa
    */
  hasActiveSubscription(): boolean {
    // Accede directamente a la propiedad user del AuthService
    const user = (this.authService as any).user;
    // Verifica si tiene plan de suscripción activo
    return !!(user?.subscription_plan?.nombre || user?.subscription_plan?.plan?.nombre);
  }

  /**
    * Verificar si hay una preferencia guardada de modo cine Y el usuario tiene suscripción
    * (Para que PublicacionComponent sepa si debe activar automáticamente)
    * Solo activa si: hay preferencia guardada EN пользователь tiene suscripción activa
    */
  hasStoredPreference(): boolean {
    // Primero verifica si hay preferencia guardada
    if (!this.getStoredPreference()) {
      return false;
    }
    // Luego verifica si el usuario tiene suscripción activa
    return this.hasActiveSubscription();
  }
}