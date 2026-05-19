import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserNotificationService } from '../../../services/browser-notification.service';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-network-status-button',
    imports: [MatIcon, MatTooltipModule, MatButtonModule],
    templateUrl: './network-status-button.component.html',
    styleUrl: './network-status-button.component.scss'
})
export class NetworkStatusButtonComponent {
  isOnline: boolean;

  constructor(
    private networkService: BrowserNotificationService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (isPlatformBrowser(platformId)) {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.isOnline = true);
      window.addEventListener('offline', () => this.isOnline = false);
      this.networkService.isOnline$.pipe(takeUntilDestroyed()).subscribe((online) => {
        //this.isOnline = online;
      });
    }
  }
}
