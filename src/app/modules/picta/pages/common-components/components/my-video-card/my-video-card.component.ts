import { Component, Input, OnInit, input, output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CredentialsService } from '../../../../services/credentials.service';
import { UserModel } from '../../../../models/user.model';
import { AuthService } from '../../../../../../services/auth.service';
import {UserPlaylistDialogComponent} from '../../../medias/components/publicacion/user-playlist-dialog/user-playlist-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DownloadPopupComponent } from '../../../../components/download-popup/download-popup.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Publication } from '../../../medias/models/publicacion.model';
import { MatLine } from '@angular/material/core';
import { MatListItem } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { ShortNumbersPipe } from '../../../medias/pipes/short-numbers.pipe';

@Component({
    selector: 'app-my-video-card',
    templateUrl: './my-video-card.component.html',
    styleUrls: ['./my-video-card.component.scss'],
    providers: [ShortNumbersPipe],
    imports: [NgOptimizedImage, MatButton, MatIcon, MatTooltip, RouterLink, MatIconButton, MatListItem, MatLine, UpperCasePipe, ShortNumbersPipe]
})
export class MyVideoCardComponent implements OnInit {
  private router = inject(Router);
  private credentialsService = inject(CredentialsService);
  authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private iconRegistry = inject(MatIconRegistry);
  private bottomSheet = inject(MatBottomSheet);

  readonly video = input(undefined);
  @Input() item: any;
  readonly activeVideo = output<Publication>();
  readonly showDetails = input<boolean>(undefined);
  readonly mode = input('card');
  user: UserModel;
  isAdmin: boolean;
  continue = -1;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const iconRegistry = this.iconRegistry;
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'live_streaming',
      sanitizer.bypassSecurityTrustResourceUrl('icons/live_streaming.svg'));
  }

  ngOnInit() {
    this.user = this.credentialsService.credentials && this.credentialsService.credentials.user;
    if (this.user) {
      this.setPermissions();
    }
    this.authService.user$.subscribe(user => {
      if (user) {
        this.user = user;
        this.setPermissions();
      } else {
        delete this.user;
        this.isAdmin = false;
      }
    });
    this.continueWatching();
  }

  openDownload() {
    const ref = this.bottomSheet.open(DownloadPopupComponent, {
      data: { video: this.video() },
      panelClass: 'bottomSheet'
    });
  }

  navigate(item) {
    if (item.tipo === 'canal') {
      this.router.navigate(['/canal', item.alias]);
    } else if (item.tipo === 'lista_reproduccion_canal') {
      const slug = item.publicaciones[0].slug_url;
      this.router.navigate(['/medias', slug]);
    } else if(item.categoria.tipologia.nombre === 'Shorts'){
      this.router.navigate(['/short', item.slug_url]);
    }
    else {      
      this.router.navigate(['/medias', item.slug_url]);
    }
  }

  details() {
    this.activeVideo.emit(this.video());
  }

  openUserPlaylist() {
    this.dialog.open(UserPlaylistDialogComponent, { data: { pubId: this.video().id } }).afterClosed().subscribe(result => {
      if (result) {
        const ref = this.snackBar.open(`Video guardado en la lista ${result.nombre}`, 'Ver mis listas');
        ref.onAction().subscribe(() => {
          this.router.navigate(['/profile/playlists']);
        });
      }
    });
  }

  private setPermissions() {
    this.isAdmin = this.user.groups.filter((g: any) => g.id === 4 || g.id === 5).length > 0;
  }

  continueWatching() {
    const time = localStorage.getItem(this.video().slug_url);
    if (time) {
      const duration = this.video().duracion;
      const a = duration.split(':'); // split
      let seconds = 0;
      if (a.length === 3) {
        seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
      } else if (a.length === 2) {
        seconds = (+a[0]) * 60 + (+a[1]);
      } else {
        seconds = (+a[0]);
      }
      this.continue = parseFloat(time) / seconds * 100;
    }
  }
}
