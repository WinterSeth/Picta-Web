import { Injectable, signal } from '@angular/core';
import { Perfil } from './perfiles.service';

const ACTIVE_PROFILE_KEY = 'active-profile-id';

@Injectable({ providedIn: 'root' })
export class ActivePerfilService {
  private activeProfileId = signal<number | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get the active profile ID as a signal
   */
  getActiveProfileId() {
    return this.activeProfileId.asReadonly();
  }

  /**
   * Get the active profile ID value
   */
  getActiveProfileIdValue(): number | null {
    return this.activeProfileId();
  }

  /**
   * Set the active profile ID and save to localStorage
   */
  setActiveProfileId(id: number | null): void {
    this.activeProfileId.set(id);
    if (id !== null) {
      try {
        localStorage.setItem(ACTIVE_PROFILE_KEY, String(id));
      } catch (e) {
        console.warn('Could not save active profile to localStorage', e);
      }
    } else {
      this.clearActiveProfile();
    }
  }

  /**
   * Check if a profile is selected
   */
  hasActiveProfile(): boolean {
    return this.activeProfileId() !== null;
  }

  /**
   * Clear the active profile from memory and localStorage
   */
  clearActiveProfile(): void {
    this.activeProfileId.set(null);
    try {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    } catch (e) {
      console.warn('Could not clear active profile from localStorage', e);
    }
  }

  /**
   * Load active profile from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (storedId) {
        this.activeProfileId.set(Number(storedId));
      }
    } catch (e) {
      console.warn('Could not load active profile from localStorage', e);
    }
  }
}