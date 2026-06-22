import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const DEVICE_ID_KEY = 'X_Device_Id';

// Simple dummy storage for SSR
class DummyStorage implements Storage {
  private data: Record<string, string> = {};
  length = 0;
  clear(): void { this.data = {}; }
  getItem(key: string): string | null { return this.data[key] ?? null; }
  key(_index: number): string | null { return null; }
  removeItem(key: string): void { delete this.data[key]; }
  setItem(key: string, value: string): void { this.data[key] = value; }
}

@Injectable({
  providedIn: 'root',
})
export class LocalstorageService implements Storage {
  private storage: Storage;

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    // Use localStorage directly in browser - no need to wait for BehaviorSubject
    if (isPlatformBrowser(platformId)) {
      this.storage = localStorage;
    } else {
      // Dummy storage for SSR
      this.storage = new DummyStorage();
    }
  }

  [name: string]: any;

  length: number;

  clear(): void {
    this.storage.clear();
  }

  getItem(key: any): any | null {
    return this.storage.getItem(key);
  }

  key(index: number): string | null {
    return this.storage.key(index);
  }

  removeItem(key: string): void {
    return this.storage.removeItem(key);
  }

  setItem(key: any, value: string): void {
    return this.storage.setItem(key, value);
  }

  // ========== Device ID Management ==========
  
  getDeviceId(): string | null {
    return this.getItem(DEVICE_ID_KEY);
  }

  setDeviceId(deviceId: string): void {
    this.setItem(DEVICE_ID_KEY, deviceId);
  }

  clearDeviceId(): void {
    this.removeItem(DEVICE_ID_KEY);
  }
}