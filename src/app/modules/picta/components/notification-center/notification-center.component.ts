import { Component, OnInit, inject, effect } from '@angular/core';
import {NotificacionPublicacionService} from '../../services/notificacion-publicacion.service';
import {NotificationStoreService, Notificacion} from '../../services/notification-store.service';
import {AuthService} from '../../../../services/auth.service';
import {PictaResponse} from '../../models/response.picta.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NotificacionItemComponent } from '../common/notificacion-item/notificacion-item.component';

@Component({
    selector: 'app-notification-center',
    templateUrl: './notification-center.component.html',
    styleUrls: ['./notification-center.component.scss'],
    imports: [NotificacionItemComponent, MatProgressSpinner]
})
export class NotificationCenterComponent implements OnInit {
  private notificacionPublicacionService = inject(NotificacionPublicacionService);
  private notificationStore = inject(NotificationStoreService);
  private authService = inject(AuthService);

  notificacionesList: Notificacion[] = [];
  notificationsParams = {
    page: 1,
    page_size: 10
  };
  loadingNotifications: boolean;
  private notificationsLoaded = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    // Sincronizar cuando el store actualice
    effect(() => {
      const list = this.notificationStore.notificaciones();
      if (list.length > 0 && !this.notificationsLoaded) {
        this.notificacionesList = list;
        this.notificationsLoaded = true;
        this.markNotificationAsReaded();
      }
    });
  }

  ngOnInit() {
    // Usar el store - carga cache o hace request si no hay datos
    this.notificationStore.load();
  }

  loadNotifications() {
    this.notificationStore.load(true);
  }

  getMoreNotifications() {
    this.notificationStore.loadMore();
  }

  onNotificationScroll(event: Event) {
    const target = event.target as HTMLElement;
    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 48;

    if (isNearBottom && !this.loadingNotifications && this.notificationsParams.page) {
      this.getMoreNotifications();
    }
  }

  async markNotificationAsReaded() {
    const unread = this.notificacionesList.filter(n => !n.vista);
    if (unread.length === 0) return;

    const ids = unread.map(n => String(n.id)).join(',');
    await this.notificationStore.markAsRead(ids);
    this.authService.setNotifications(true);
  }
}
