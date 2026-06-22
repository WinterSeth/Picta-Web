import { Component, OnInit, input, inject } from '@angular/core';
import {UserPlaylist} from '../../models/user-playlist';
import {UserPlaylistService} from '../../services/user-playlist.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmDialogComponent} from '../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PublicationService} from '../../../medias/services/publication-service';
import { MatIcon } from '@angular/material/icon';
import { MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatList, MatListItem, MatListItemIcon, MatListItemTitle, MatListItemLine, MatListItemMeta } from '@angular/material/list';

@Component({
    selector: 'app-playlist-edit',
    templateUrl: './playlist-edit.component.html',
    styleUrls: ['./playlist-edit.component.scss'],
    imports: [MatList, MatListItem, MatListItemIcon, MatListItemTitle, MatListItemLine, MatListItemMeta, MatIconAnchor, MatIcon, MatIconButton]
})
export class PlaylistEditComponent implements OnInit {
  private userPlaylistService = inject(UserPlaylistService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private publicationService = inject(PublicationService);
  private router = inject(Router);

  playlist = input<UserPlaylist>(undefined);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

  removeFromList(id: number) {
    this.dialog.open(ConfirmDialogComponent,
      {data: {msg: '¿Estás seguro que deseas quitar esta publicación de la lista?'}}).afterClosed().subscribe(result => {
      if (result) {
        this.playlist().publicacion = this.playlist().publicacion.filter(p => p.id !== id);
        this.userPlaylistService.update(this.playlist().id, {publicacion: this.playlist().publicacion.map(p => p.id)}).subscribe(() => {
          this.snackBar.open('Publicación quitada de la lista');
        });
      }

    });
  }

  async goTo({id}) {
    const response = await this.publicationService.getPublications({id}).toPromise();
    this.router.navigate(['/medias', response.results[0].slug_url], {queryParams: {playlist: this.playlist().id}});
  }
}
