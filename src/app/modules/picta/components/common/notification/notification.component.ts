import { Component, OnInit, inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    imports: [MatIcon]
})
export class NotificationComponent implements OnInit {
  data = inject(MAT_SNACK_BAR_DATA);

  type: 'ok' | 'error' | 'notification';
  icon = 'check';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    switch (this.data.type) {
      case 'ok':
        this.icon = 'check';
        break;
      case 'error' :
        this.icon = 'error';
        break;
      case 'notification' :
        this.icon = 'notification_important';
        break;
      default:
        this.icon = 'ok';
    }
  }

}
