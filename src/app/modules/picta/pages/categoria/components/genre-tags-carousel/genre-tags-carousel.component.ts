import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { GenreTagCardComponent } from '../genre-tag-card/genre-tag-card.component';
import { firstValueFrom } from 'rxjs';
import { Genero } from '../../../medias/models/publicacion.model';
import { GeneroService } from '../../../serie/services/genero.service';
import {
  GenreExplorerDialogComponent,
  GenreExplorerDialogData,
} from '../genre-explorer-dialog/genre-explorer-dialog.component';

export interface GenreCarouselTag {
  id: number;
  label: string;
  value: string;
  trackBy: string | number;
  showFavorite: boolean;
  isFavorite: boolean;
  favoriteOnly: boolean;
}

@Component({
  selector: 'app-genre-tags-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './genre-tags-carousel.component.html',
  styleUrls: ['./genre-tags-carousel.component.scss'],
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    CarouselModule,
    GenreTagCardComponent,
  ],
})
export class GenreTagsCarouselComponent {
  private readonly dialog = inject(MatDialog);
  private readonly generoService = inject(GeneroService);
  private readonly snackBar = inject(MatSnackBar);

  explorerLoading = false;

  tags = input<GenreCarouselTag[]>([]);
  options = input.required<OwlOptions>();
  selectedValue = input<string>('');
  favoriteTrack = input(false);
  prevDisabled = input(false);
  nextDisabled = input(false);
  loading = input(false);
  favoriteIds = input<number[]>([]);
  explorerTitle = input('Explorar géneros');
  explorerButtonLabel = input('Mostrar todos');
  showExplorerHeader = input(false);
  explorerSubtitle = input('');
  explorerKind = input<'ci' | 'mu'>('ci');
  excludeShowNovela = input(false);

  groupAriaLabel = input('Carrusel de géneros');
  trackAriaLabel = input('Géneros');
  prevAriaLabel = input('Anteriores');
  nextAriaLabel = input('Siguientes');

  favoriteAriaAdd = input('Agregar a favoritos');
  favoriteAriaRemove = input('Quitar de favoritos');

  navigatePrev = output<any>();
  navigateNext = output<any>();
  translated = output<any>();
  tagSelected = output<string>();
  favoriteToggled = output<{
    id: number;
    label: string;
    value: string;
    event: Event;
  }>();
  showAllRequested = output<void>();

  onPrevClick(carousel: any): void {
    this.navigatePrev.emit(carousel);
  }

  onNextClick(carousel: any): void {
    this.navigateNext.emit(carousel);
  }

  onTranslated(event: any): void {
    this.translated.emit(event);
  }

  onTagSelected(value: string): void {
    this.tagSelected.emit(value);
  }

  onFavoriteToggled(event: {
    id: number;
    label: string;
    value: string;
    event: Event;
  }): void {
    this.favoriteToggled.emit(event);
  }

  async openExplorer(): Promise<void> {
    if (this.explorerLoading) {
      return;
    }

    this.showAllRequested.emit();
    this.explorerLoading = true;

    try {
      const allTags = await this.loadAllGenres();
      const dialogRef = this.dialog.open<
        GenreExplorerDialogComponent,
        GenreExplorerDialogData,
        string
      >(GenreExplorerDialogComponent, {
        data: {
          title: this.explorerTitle(),
          subtitle: this.explorerSubtitle() || undefined,
          tags: allTags,
          selectedValue: this.selectedValue(),
          favoriteAriaAdd: this.favoriteAriaAdd(),
          favoriteAriaRemove: this.favoriteAriaRemove(),
        },
        width: 'min(96vw, 1120px)',
        maxWidth: '1120px',
        panelClass: 'genre-explorer-panel',
        backdropClass: 'genre-explorer-backdrop',
        autoFocus: false,
        enterAnimationDuration: '220ms',
        exitAnimationDuration: '160ms',
      });

      dialogRef.componentInstance.selected.subscribe(value =>
        this.tagSelected.emit(value),
      );
      dialogRef.componentInstance.favoriteToggled.subscribe(event =>
        this.favoriteToggled.emit(event),
      );
    } catch {
      this.snackBar.open(
        'No se pudieron cargar los generos. Intenta nuevamente.',
        'Cerrar',
        {
          duration: 4500,
        },
      );
    } finally {
      this.explorerLoading = false;
    }
  }

  private async loadAllGenres(): Promise<GenreCarouselTag[]> {
    const response = await firstValueFrom(
      this.generoService.getAll({ tipo: this.explorerKind(), page_size: 1000 }),
    );

    let genres = response.results ?? [];

    // Excluir géneros específicos para series
    if (this.excludeShowNovela()) {
      const excludedGenres = [
        'Videojuego',
        'Infantil',
        'Show',
        'Anime',
        'Dorama',
        'Deportivo',
        'Novela',
        'Documental',
      ];
      genres = (genres as Genero[]).filter(
        (genre: Genero) => !excludedGenres.includes(genre.nombre),
      );
    }

    return genres.map((genre: Genero) => ({
      id: genre.id,
      label: genre.nombre,
      value: genre.nombre,
      trackBy: genre.id,
      showFavorite: true,
      isFavorite: this.favoriteIds().includes(genre.id),
      favoriteOnly: false,
    }));
  }
}
