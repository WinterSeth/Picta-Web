import { Component, OnInit, inject } from '@angular/core';
import {UserPlaylistService} from '../../../../profile/services/user-playlist.service';
import {UserPlaylist} from '../../../../profile/models/user-playlist';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import {CredentialsService} from '../../../../../services/credentials.service';
import {PlaylistFormComponent} from '../../../../profile/components/playlist-form/playlist-form.component';
import {PictaResponse} from '../../../../../models/response.picta.model';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { MatSelectionList, MatListOption } from '@angular/material/list';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../../../../../services/notification.service';

@Component({
    selector: 'app-user-playlist-dialog',
    templateUrl: './user-playlist-dialog.component.html',
    styleUrls: ['./user-playlist-dialog.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, MatSelectionList, ReactiveFormsModule, MatListOption, MatButton, MatDialogActions, MatDialogClose, MatIcon, MatProgressSpinner]
})
export class UserPlaylistDialogComponent implements OnInit {
  private userPlaylistService = inject(UserPlaylistService);
  dialogRef = inject<MatDialogRef<UserPlaylistDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private credentialsService = inject(CredentialsService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  playlists: UserPlaylist[] = [];
  publicacionesControl = new UntypedFormControl();
  loadingPlaylists = true;
  savingPlaylist = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.loadUserPlaylists();
  }

  save() {
    const selectedPlaylistId = Array.isArray(this.publicacionesControl.value)
      ? this.publicacionesControl.value[0]
      : this.publicacionesControl.value;

    if (!selectedPlaylistId) {
      this.notificationService.open('error', 'Selecciona una lista antes de guardar.');
      return;
    }

    this.savingPlaylist = true;
    const playlist = this.playlists.find(p => p.id === selectedPlaylistId);
    if (!playlist) {
      this.savingPlaylist = false;
      this.notificationService.open('error', 'No se pudo encontrar la lista seleccionada.');
      return;
    }

    if (playlist.publicacion.length) {
      playlist.publicacion = [...playlist.publicacion.map(p => p.id), this.data.pubId];
    } else {
      playlist.publicacion = [this.data.pubId];

    }
    this.userPlaylistService.update(playlist.id, {publicacion: playlist.publicacion}).pipe(
      finalize(() => {
        this.savingPlaylist = false;
      })
    ).subscribe({
      next: () => {
        this.notificationService.open('ok', 'La publicación se guardó en la lista.');
        this.dialogRef.close(playlist);
      },
      error: () => {
        this.notificationService.open('error', 'No se pudo guardar la publicación en la lista.');
      }
    });
  }

  showCreateDialog() {
    this.dialog.open(PlaylistFormComponent, {
      panelClass: 'picta-dark-dialog',
      backdropClass: 'picta-dialog-backdrop',
      width: 'min(380px, 96vw)',
      maxWidth: '96vw',
      enterAnimationDuration: '340',
      exitAnimationDuration: '280',
    }).afterClosed().subscribe(result => {
      if (result) {
        this.savingPlaylist = true;
        this.userPlaylistService.create(result).pipe(
          finalize(() => {
            this.savingPlaylist = false;
          })
        ).subscribe({
          next: () => {
            this.notificationService.open('ok', 'La lista se creó correctamente.');
            this.loadUserPlaylists();
          },
          error: () => {
            this.notificationService.open('error', 'No se pudo crear la lista.');
          }
        });
      }
    });
  }

  private loadUserPlaylists() {
    this.loadingPlaylists = true;
    this.userPlaylistService.getAll({usuario_id: this.credentialsService.credentials.user.id}).pipe(
      finalize(() => {
        this.loadingPlaylists = false;
      })
    ).subscribe({
      next: (data: PictaResponse<UserPlaylist>) => {
        this.playlists = data.results ?? [];
        this.notificationService.open('ok', 'Tus listas se cargaron correctamente.');
      },
      error: () => {
        this.playlists = [];
        this.notificationService.open('error', 'No se pudieron cargar tus listas.');
      }
    });
  }
}
