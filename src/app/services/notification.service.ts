import { ApplicationRef, EnvironmentInjector, Injectable, createComponent, inject, DOCUMENT } from '@angular/core';

import { Router } from '@angular/router';
import { NotificationAction, NotificationToastComponent } from '../components/notification-toast/notification-toast.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  open(type: 'ok' | 'notification' | 'error', msg: string, action?: { label: string; url: string } | NotificationAction) {
    let mappedAction: NotificationAction | undefined;

    if (action) {
      if ('url' in action) {
        mappedAction = {
          label: action.label,
          url: action.url,
          onClick: () => this.router.navigate([action.url])
        };
      } else {
        mappedAction = action;
      }
    }

    this.showToast(type, msg, mappedAction);
  }

  openNotification(msg: string, slug: string) {
    this.showToast('notification', msg, {
      label: 'Ir al video',
      onClick: () => this.router.navigate(['/medias', slug])
    });
  }

  private showToast(type: 'ok' | 'notification' | 'error', msg: string, action?: NotificationAction) {
    // create toast component

    const container = this.getContainer();

    let componentRef;
    try {
      componentRef = createComponent(NotificationToastComponent, {
        environmentInjector: this.envInjector
      });
    } catch (err) {
      console.error('Error creating NotificationToastComponent:', err);
      return;
    }

    componentRef.setInput('type', type);
    componentRef.setInput('message', msg);
    componentRef.setInput('action', action ?? null);
    componentRef.setInput('duration', 5000);

    const sub = componentRef.instance.closed.subscribe(() => {
      sub.unsubscribe();
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });

    this.appRef.attachView(componentRef.hostView);
    container.appendChild(componentRef.location.nativeElement);
  }

  private getContainer(): HTMLElement {
    const existing = this.document.getElementById('islaplay-toast-root');
    if (existing) return existing;

    const container = this.document.createElement('div');
    container.id = 'islaplay-toast-root';
    container.className = 'fixed right-4 top-4 z-[9999] flex max-w-sm flex-col gap-3 pointer-events-none';
    this.document.body.appendChild(container);
    return container;
  }
}
