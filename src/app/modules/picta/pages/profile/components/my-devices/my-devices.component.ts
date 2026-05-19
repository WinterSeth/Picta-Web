import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { UserDeviceService } from '../../../../../../services/user-device.service';
import { NotificationService } from '../../../../../../services/notification.service';

interface UserDevice {
  id: number;
  os?: string;
  browser?: string;
  ua_string?: string;
  last_used?: string;
  current?: boolean;
  is_current?: boolean;
}

@Component({
  selector: 'app-my-devices',
  templateUrl: './my-devices.component.html',
  styleUrls: ['./my-devices.component.scss'],
  imports: [DatePipe, MatIcon]
})
export class MyDevicesComponent implements OnInit {
  private userDeviceService = inject(UserDeviceService);
  private notificationService = inject(NotificationService);

  devices: UserDevice[] = [];
  loading = true;
  error: string;
  deleting: number | null = null;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.loading = true;
    this.error = null;
    this.userDeviceService
      .getUserDevices()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (Array.isArray(response)) {
            this.devices = response;
            return;
          }

          if (Array.isArray(response?.results)) {
            this.devices = response.results;
            return;
          }

          this.devices = [];
        },
        error: () => {
          this.devices = [];
          this.error = 'No fue posible cargar tus dispositivos.';
        },
      });
  }

  logoutDevice(id: number): void {
    this.deleting = id;
    this.userDeviceService
      .deleteUserDevice(id)
      .pipe(finalize(() => (this.deleting = null)))
      .subscribe({
        next: () => {
          this.devices = this.devices.filter(device => device.id !== id);
          this.notificationService.open('ok', 'Sesión cerrada correctamente en el dispositivo.');
        },
        error: () => {
          this.notificationService.open('error', 'No se pudo cerrar sesión en el dispositivo.');
        },
      });
  }

  isCurrentDevice(device: UserDevice): boolean {
    if (device.current || device.is_current) {
      return true;
    }

    if (typeof navigator === 'undefined') {
      return false;
    }

    return !!device.ua_string && device.ua_string === navigator.userAgent;
  }

  getDeviceIcon(device: UserDevice): string {
    const os = (device.os || '').toLowerCase();

    if (os.includes('android')) {
      return 'android';
    }

    if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) {
      return 'phone_iphone';
    }

    if (os.includes('windows') || os.includes('linux') || os.includes('mac')) {
      return 'laptop_mac';
    }

    return 'devices';
  }

  getOsIcon(os?: string): string {
    const normalized = (os || '').toLowerCase();

    if (normalized.includes('windows')) {
      return 'desktop_windows';
    }

    if (normalized.includes('android')) {
      return 'android';
    }

    if (normalized.includes('ios') || normalized.includes('iphone') || normalized.includes('ipad')) {
      return 'phone_iphone';
    }

    if (normalized.includes('mac')) {
      return 'laptop_mac';
    }

    if (normalized.includes('linux')) {
      return 'computer';
    }

    return 'memory';
  }

  getBrowserIcon(browser?: string): string {
    const normalized = (browser || '').toLowerCase();

    if (normalized.includes('chrome')) {
      return 'language';
    }

    if (normalized.includes('firefox')) {
      return 'public';
    }

    if (normalized.includes('safari')) {
      return 'travel_explore';
    }

    if (normalized.includes('edge')) {
      return 'edge_sensor_high';
    }

    return 'web';
  }
}
