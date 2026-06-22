import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GenreCarouselTag } from '../genre-tags-carousel/genre-tags-carousel.component';
import { GenreTagCardComponent } from '../genre-tag-card/genre-tag-card.component';
import { modalScaleInAnimation } from '../../../../animations/dialogs';

export interface GenreExplorerDialogData {
  title: string;
  subtitle?: string;
  tags: GenreCarouselTag[];
  selectedValue: string;
  favoriteAriaAdd: string;
  favoriteAriaRemove: string;
}

@Component({
  selector: 'app-genre-explorer-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './genre-explorer-dialog.component.html',
  styleUrls: ['./genre-explorer-dialog.component.scss'],
  animations: [modalScaleInAnimation],
  host: {
    '[@modalScaleIn]': '',
  },
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    GenreTagCardComponent,
  ],
})
export class GenreExplorerDialogComponent {
  readonly data = inject<GenreExplorerDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<GenreExplorerDialogComponent>>(MatDialogRef);
  private readonly cdr = inject(ChangeDetectorRef);

  searchTerm = signal('');
  filteredTags = signal<GenreCarouselTag[]>(this.data.tags);

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (!term.trim()) {
      this.filteredTags.set(this.data.tags);
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredTags.set(
        this.data.tags.filter(
          tag =>
            tag.label.toLowerCase().includes(lowerTerm) ||
            tag.value.toLowerCase().includes(lowerTerm),
        ),
      );
    }
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.filteredTags.set(this.data.tags);
  }

  readonly selected = output<string>();
  readonly favoriteToggled = output<{
    id: number;
    label: string;
    value: string;
    event: Event;
  }>();

  onSelect(value: string): void {
    this.selected.emit(value);
    this.dialogRef.close(value);
  }

  onFavoriteToggled(event: {
    id: number;
    label: string;
    value: string;
    event: Event;
  }): void {
    // Actualizar el estado de favorito en los tags
    this.data.tags = this.data.tags.map(tag =>
      tag.id === event.id
        ? {
            ...tag,
            isFavorite: !tag.isFavorite,
          }
        : tag,
    );

    // Actualizar filteredTags también
    const term = this.searchTerm();
    if (!term.trim()) {
      this.filteredTags.set([...this.data.tags]);
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredTags.set(
        this.data.tags.filter(
          tag =>
            tag.label.toLowerCase().includes(lowerTerm) ||
            tag.value.toLowerCase().includes(lowerTerm),
        ),
      );
    }

    // Forzar detección de cambios
    this.cdr.markForCheck();

    this.favoriteToggled.emit(event);
  }

  close(): void {
    this.dialogRef.close();
  }
}
