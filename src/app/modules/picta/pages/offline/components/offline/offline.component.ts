import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { BrowserNotificationService } from '../../../../../../services/browser-notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-offline',
    templateUrl: './offline.component.html',
    styleUrls: ['./offline.component.scss'],
    imports: [MatIcon, MatTooltipModule, MatButtonModule]
})
export class OfflineComponent {
  private networkService = inject(BrowserNotificationService);

  isOnline: boolean;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.networkService.isOnline$.pipe(takeUntilDestroyed()).subscribe((online) => {
      this.isOnline = online;
    });
  }

}
