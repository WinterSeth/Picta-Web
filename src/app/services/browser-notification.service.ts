import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class BrowserNotificationService {
  result = 'default';
  private isOnlineSubject = new BehaviorSubject<boolean>(false); // Valor inicial false
  isOnline$ = this.isOnlineSubject.asObservable();

  private supportsNotifications = false;

  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private localStorage = inject(LocalstorageService);

  constructor(
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (isPlatformBrowser(platformId)) {
      this.isOnlineSubject.next(navigator.onLine);
      window.addEventListener('online', () => this.updateOnlineStatus());
      window.addEventListener('offline', () => this.updateOnlineStatus());
      this.supportsNotifications = typeof Notification !== 'undefined';
      if (!this.supportsNotifications) {
        console.warn('Notifications API no está disponible en este navegador.');
      } else {
        this.requestPermission();
      }
    }
  }
  
  private updateOnlineStatus() {
    const isOnline = navigator.onLine;
    this.isOnlineSubject.next(isOnline);

    if (!isOnline) {
      this.notificationService.open('error', 'Sin conexión a Internet');
    } else {
      this.notificationService.open('ok', 'Conexión restablecida');
    }
  }

  async requestPermission() {
    if (!isPlatformBrowser(this.platformId) || typeof Notification === 'undefined') {
      return;
    }

    try {
      const result = await Notification.requestPermission();
      this.result = result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  checkNotificationPromise() {
    if (typeof Notification === 'undefined') {
      return false;
    }

    try {
      // some browsers return a Promise, others don't — we only check for exceptions here
      Notification.requestPermission().then(() => {});
      return true;
    } catch (e) {
      return false;
    }
  }

  showNotification({ data, identificador }) {
    // If this notification is from a channel, and the channel is silenced in localStorage, skip browser notification
    try {
      const channelName = data?.nombre_canal;
      if (channelName) {
        const stored = this.localStorage.getItem('silenced_channels');
        const silenced = stored ? JSON.parse(stored) : [];
        if (Array.isArray(silenced) && silenced.includes(channelName)) {
          // Channel is silenced — do not show native/browser notification
          return;
        }
      }
    } catch (err) {
      // If localStorage access fails for any reason, proceed with notification
      console.error('Error reading silenced_channels from localStorage:', err);
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof Notification === 'undefined') {
      console.warn('Notifications API no disponible.');
      this.notificationService.open('notification', 'Notificaciones del navegador no soportadas');
      return;
    }

    const perm = String(Notification.permission);

    if (perm !== 'granted') {
      console.warn('Permiso de notificaciones no concedido:', perm);
      // Intentar solicitar permiso de nuevo si está en default y esperar el resultado
      if (perm === 'default') {
        this.requestPermission();
      }

      // Re-check permission synchronously after any possible request
      const perm2 = String(Notification.permission);
      if (perm2 !== 'granted') {
        return;
      }
    }

    let text;
    let title;
    let url;
    let img;

    switch (identificador) {
      case 'publicacion_nueva': {
        text = `${data.nombre_canal} ha publicado un nuevo video: ${data.nombre_publicacion}.`;
        title = `Picta - Publicación nueva`;
        url = data.slug_url;
        img = data.url_imagen;
        break;
      }
      case 'publicacion_convertida': {
        text = `${data.nombre_canal} ha publicado un nuevo video: ${data.nombre_publicacion}.`;
        title = `Picta - Publicación convertida`;
        url = data.slug_url;
        img = data.url_imagen;
        break;
      }
      case 'respuesta_comentario': {
        title = `Picta - Respuesta de comentario`;
        text = `${data.usuario_username} ha respondido tu comentario en la publicación: ${data.publicacion_nombre}.`;
        url = data.publicacion_slug_url;
        img = data.usuario_avatar;
        break;
      }
      case 'solicitud_nueva': {
        title = `Picta - Nueva solicitud ${
          data.tipo === 'seller' ? 'de publicador' : 'de canal'
        }`;
        // ...existing code...
        text = `El usuario ${
          data.tipo === 'seller'
            ? data.data.data.data.data.name
            : data.data.data.data.data.user.username
        } ha solicitado ${
          data.tipo === 'seller'
            ? 'ser publicador'
            : `el canal: ${data.data.data.data.data.nombre}`
        }`;
        url = `${
          data.tipo === 'seller'
            ? 'https://admin.picta.cu/solicitud'
            : 'https://admin.picta.cu/solicitud-canal'
        }`;
        break;
      }
      case 'alerta': {
        title = `Picta - Nuevo Mensaje`;
        text = data.msg;
        url = '/';
        break;
      }
      case 'issue_report': 
      case 'issue_report_notification': {
        title = 'Picta - Reporte respondido';
        text = 'Su reporte ha sido respondido por un administrador';
        url = '/ayuda-soporte';
        break;
      }
      default: {
        return;
      }
    }

    try {
      // Primero intentar crear la notificación directamente
      setTimeout(() => {
        try {
          const notification = new Notification(title, {
            body: text,
            icon: img,
            requireInteraction: true
          });

          notification.onclick = () => {
            window.focus();
            if (identificador === 'solicitud_nueva' || identificador === 'issue_report' || identificador === 'issue_report_notification') {
              window.open(url, '_blank');
            } else if (url && url.startsWith('/')) {
              this.router.navigate([url]);
            } else if (url) {
              this.router.navigate(['/medias', url]);
            }
            notification.close();
          };
        } catch (err) {
          console.error('Error creando notificación directa:', err);
        }
      }, 0);

      // Fallback: intentar mostrar via Service Worker si está disponible
      try {
        if (navigator && 'serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg && reg.showNotification) {
              try {
// Duración de 8 segundos (8000ms)
                const options = { 
                  body: text, 
                  icon: img, 
                  requireInteraction: true,
                  vibrate: [200, 100, 200],
                  lang: 'es-ES'
                };
                reg.showNotification(title, options);
              } catch (swErr) {
                console.error('Error mostrando notificación via ServiceWorker:', swErr);
              }
            }
          }).catch(() => {});
        }
      } catch (swTestErr) {
        // ignore
      }
    } catch (error) {
      console.error('Error al intentar crear la notificación nativa (outer):', error);
    }
  }
}
