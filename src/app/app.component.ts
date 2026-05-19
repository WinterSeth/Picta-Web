import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {PanelCloseService} from './services/panel-close.service';
import {BehaviorSubject, Observable} from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { RouterOutlet } from '@angular/router';
import { BrowserNotificationService } from './services/browser-notification.service';
import { NetworkStatusButtonComponent } from './modules/offline/network-status-button/network-status-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet, NetworkStatusButtonComponent, MatButtonModule, MatIconModule, MatBadgeModule]
})
export class AppComponent {
  static isBrowser = new BehaviorSubject<boolean>(null);
  isOnline$: Observable<boolean>;
  title = 'Picta';
  isActive = false;
  event;
  showButton = false;

  public updateAvailable = false;

  public isUpdateAvailable = false;
  public deferredPrompt: any;

  constructor(
    private swUpdate: SwUpdate, 
    private titleService: Title,
    private closePanel: PanelCloseService,
    @Inject(PLATFORM_ID) private platformId: any,
    private browserService: BrowserNotificationService
    ) {
      window.addEventListener('scroll', () => {
      this.showButton = window.scrollY > 100;
    });
      this.isOnline$ = this.browserService.isOnline$;
      AppComponent.isBrowser.next(isPlatformBrowser(platformId));
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          this.updateAvailable = true;
        }
      });
    }
  }

  goTop() {
    document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateApp() {
    this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  clicked() {
    this.closePanel.closeAllPanel();
  }
}
