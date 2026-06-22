import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import {UserPlaylistService} from '../../services/user-playlist.service';
import {UserPlaylist} from '../../models/user-playlist';
import {MatDialog} from '@angular/material/dialog';
import {PlaylistFormComponent} from '../playlist-form/playlist-form.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CredentialsService} from '../../../../services/credentials.service';
import {AuthService} from '../../../../../../services/auth.service';
import {UserModel} from '../../../../models/user.model';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {PictaResponse} from '../../../../models/response.picta.model';
import { PlaylistTableComponent } from '../playlist-table/playlist-table.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-my-playlist',
    templateUrl: './my-playlist.component.html',
    styleUrls: ['./my-playlist.component.scss'],
    imports: [MatButton, MatIcon, MatIconButton, MatProgressSpinner, PlaylistTableComponent]
})
export class MyPlaylistComponent implements OnInit {
  private userPlaylistService = inject(UserPlaylistService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private credentialsService = inject(CredentialsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  playlists: UserPlaylist[] = [];
  user: UserModel;
  loading = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.titleService.setTitle('Mis listas - Perfil');

    this.userPlaylistService.onPlaylistChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadUserPlaylists();
    });
    if (this.credentialsService.credentials && this.credentialsService.credentials.user) {
      this.user = this.credentialsService.credentials.user;
    }
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.user = user;
        this.loadUserPlaylists();
      } else {
        this.router.navigate(['']);
      }
    });
  }

  openCreateDialog() {
    this.dialog.open(PlaylistFormComponent).afterClosed().subscribe(val => {
      if (val) {
        this.userPlaylistService.create(val).subscribe(data => {
          this.loadUserPlaylists();
        });
      }
    });
  }

  delete(id?: number) {
    if (id == null) {
      return;
    }

    this.userPlaylistService.delete(id).subscribe(() => {
      this.snackBar.open('Lista eliminada');
      this.loadUserPlaylists();
    });
  }

  private loadUserPlaylists() {
    const userId = this.user?.id || this.credentialsService.credentials?.user?.id;
    if (!userId) {
      this.playlists = [];
      return;
    }

    this.loading = true;
    this.userPlaylistService.getAll({ usuario_id: userId }).pipe(
      finalize(() => this.loading = false)
    ).subscribe((data: PictaResponse<UserPlaylist>) => {
      this.playlists = [...data.results];
    });
  }
}
