import { Component, OnInit, PLATFORM_ID, output, inject } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SubSink } from 'subsink';
import { AuthService } from '../../../../services/auth.service';
import { SubscriptionService } from '../../../../services/subscription.service';
import { PanelCloseService } from '../../../../services/panel-close.service';
import { UserPlaylistService } from '../../pages/profile/services/user-playlist.service';
import { Observable } from 'rxjs';
import { UserPlaylist } from '../../pages/profile/models/user-playlist';
import { delay, map, pluck, retryWhen, take } from 'rxjs';
import { PublicationService } from '../../pages/medias/services/publication-service';
import { isPlatformBrowser, AsyncPipe, UpperCasePipe } from '@angular/common';
import { MatLine } from '@angular/material/core';
import { MatNavList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler, MatListItemAvatar } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    imports: [
    MatIconButton,
    MatIcon,
    MatNavList,
    MatListItem,
    RouterLink,
    RouterLinkActive,
    MatListItemIcon,
    MatLine,
    MatListSubheaderCssMatStyler,
    MatListItemAvatar,
    AsyncPipe,
    UpperCasePipe
]
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private subscribeService = inject(SubscriptionService);
  private router = inject(Router);
  private panelClose = inject(PanelCloseService);
  private userPlaylistService = inject(UserPlaylistService);
  private publicationService = inject(PublicationService);
  private platformId = inject(PLATFORM_ID);

  readonly toggleSide = output();
  isActive = false;
  loggedUser: UserModel;
  subscriptions: any[] = [];
  isAdmin: boolean;
  subs = new SubSink();
  playlists: Observable<UserPlaylist[]>;

  footerSocials = [
    { icon: 'img/facebook-icon.svg', link: 'https://www.facebook.com/share/18barwpBz7/', label: 'Facebook' },
    { icon: 'img/twitter-icon.svg', link: 'https://twitter.com/pictacuba', label: 'Twitter' },
    { icon: 'img/telegram-icon.svg', link: 'https://t.me/picta_comunidad', label: 'Telegram' },
    { icon: 'img/instagram-icon.svg', link: 'https://instagram.com/picta.social', label: 'Instagram' },
  ];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  
  constructor() {
      this.authService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
        if (user) {
          this.loggedUser = user;
          this.initSubscription();
          this.setPermissions();
          this.loadPlaylists();
          this.userPlaylistService.onPlaylistChanged.pipe(takeUntilDestroyed()).subscribe(() => {
            this.loadPlaylists();
          });
        } else {
          delete this.loggedUser;
        }
      })
  }

  ngOnInit() {
    this.panelClose.closeAll.subscribe(close => {
      this.isActive = false;
    });
  }

  initSubscription() {
    if (this.authService.isLoggedIn()) {
      this.subs.add(
        this.subscribeService
          .getAllSubscriptionsByUser({
            usuarioNombre: this.loggedUser.username,
          })
          .pipe(retryWhen(errors => errors.pipe(delay(2000), take(3))))
          .subscribe((res: any) => {
            this.subscriptions = res.results;
          })
      );
    }
  }

  public toggleSidenav($event?) {
    if ($event) {
      $event.stopPropagation();
    }
    this.isActive = !this.isActive;
    this.toggleSide.emit();
  }

  navigate(url: string) {
    this.router.navigate([url]);
    this.toggleSidenav();
  }

  logout() {
    this.authService.logout();
    this.toggleSidenav();
    this.router.navigate(['/inicio']);
  }

  openPictaAdmin() {
    if (isPlatformBrowser(this.platformId)) {
      window.open('https://admin.picta.cu/', '_blank');
    }
  }

  async goTo(playlist: UserPlaylist) {
    const response = await this.publicationService
      .getPublications({ id: playlist.publicacion[0].id })
      .toPromise();
    this.router.navigate(['/medias', response.results[0].slug_url], {
      queryParams: { playlist: playlist.id },
    });
    this.toggleSidenav();
  }

  private setPermissions() {
    const groups = this.loggedUser.groups.filter((g: any) => g.id !== 1);
    this.isAdmin = groups.length > 0;
  }

  private loadPlaylists() {
    this.playlists = this.userPlaylistService
      .getAll({ usuario_id: this.loggedUser.id })
      .pipe(
        pluck('results'),
        map((results: UserPlaylist[]) =>
          results.filter(p => p.publicacion.length)
        ),
        map((results: UserPlaylist[]) => results.slice(0, 3))
      );
  }
}
