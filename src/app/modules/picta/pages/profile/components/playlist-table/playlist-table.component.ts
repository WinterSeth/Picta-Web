import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges, input, output, inject } from '@angular/core';
import {UserPlaylist} from '../../models/user-playlist';
import {UserPlaylistService} from '../../services/user-playlist.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmDialogComponent} from '../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {PublicationService} from '../../../medias/services/publication-service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PlaylistEditComponent } from '../playlist-edit/playlist-edit.component';
import { MatIconAnchor, MatIconButton, MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent } from '@angular/material/expansion';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-playlist-table',
    templateUrl: './playlist-table.component.html',
    styleUrls: ['./playlist-table.component.scss'],
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatIcon, MatIconAnchor, MatIconButton, MatAnchor, MatButton, MatExpansionPanelContent, PlaylistEditComponent, MatProgressSpinner, DatePipe]
})
export class PlaylistTableComponent implements AfterViewInit, OnInit, OnChanges {
  private userPlaylistService = inject(UserPlaylistService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private publicationService = inject(PublicationService);

  readonly playlists = input<UserPlaylist[]>(undefined);
  readonly onDelete = output<number>();
  selectedPlaylist: UserPlaylist;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  delete(playlist: UserPlaylist) {
    const id = playlist.id;
    if (id == null) {
      return;
    }

    this.dialog.open(ConfirmDialogComponent,
      {data: {msg: '¿Estás seguro que desea eliminar esta lista?'}}).afterClosed().subscribe(result => {
      if (result) {
        this.onDelete.emit(id);
        if (this.selectedPlaylist?.id === id) {
          delete this.selectedPlaylist;
        }
      }
    });
  }

  removeFromList(id: number) {
    this.dialog.open(ConfirmDialogComponent,
      {data: {msg: '¿Estás seguro que deseas quitar esta publicación de la lista?'}}).afterClosed().subscribe(result => {
      if (result) {
        this.selectedPlaylist.publicacion = this.selectedPlaylist.publicacion.filter(p => p.id !== id);
        this.userPlaylistService.update(this.selectedPlaylist.id, {publicacion: this.selectedPlaylist.publicacion.map(p => p.id)}).subscribe(() => {
          this.snackBar.open('Publicación quitada de la lista');
        });
      }

    });
  }

  async goToPlaylist(playlist: UserPlaylist) {
    const response = await this.publicationService.getPublications({id: playlist.publicacion[0].id}).toPromise();
    this.router.navigate(['/medias', response.results[0].slug_url], {queryParams: {playlist: playlist.id}});
  }

  async goTo({id}) {
    const response = await this.publicationService.getPublications({id}).toPromise();
    this.router.navigate(['/medias', response.results[0].slug_url], {queryParams: {playlist: this.selectedPlaylist.id}});
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectFirst();
  }

  private selectFirst() {
    const playlists = this.playlists();
    if (playlists && playlists.length) {
      this.selectedPlaylist = playlists[0];
    }
  }
}
