import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { favoriteRemovalCardAnimation } from '../../../../animations/favorites';

@Component({
  selector: 'app-genre-tag-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './genre-tag-card.component.html',
  styleUrls: ['./genre-tag-card.component.scss'],
  animations: [favoriteRemovalCardAnimation],
  imports: [MatButtonModule, MatIconModule],
})
export class GenreTagCardComponent {
  private readonly removalDurationMs = 220;

  id = input(0);
  label = input.required<string>();
  value = input.required<string>();
  active = input(false);
  favoriteEnabled = input(false);
  favoriteActive = input(false);
  favoriteOnly = input(false);
  emphasizeFavorite = input(false);
  favoriteAriaAdd = input('Agregar a favoritos');
  favoriteAriaRemove = input('Quitar de favoritos');

  selected = output<string>();
  favoriteToggled = output<{ id: number; label: string; value: string; event: Event }>();
  isRemoving = false;

  onSelect(): void {
    this.selected.emit(this.value());
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    if (!this.id()) {
      return;
    }

    if (this.isRemoving) {
      return;
    }

    if (this.favoriteOnly()) {
      this.isRemoving = true;
      setTimeout(() => {
        this.favoriteToggled.emit({
          id: this.id(),
          label: this.label(),
          value: this.value(),
          event,
        });
      }, this.removalDurationMs);
      return;
    }

    this.favoriteToggled.emit({
      id: this.id(),
      label: this.label(),
      value: this.value(),
      event,
    });
  }

  favoriteIcon(): string {
    return this.favoriteOnly() || this.favoriteActive() ? 'favorite' : 'favorite_border';
  }

  favoriteAriaLabel(): string {
    return this.favoriteOnly() || this.favoriteActive() ? this.favoriteAriaRemove() : this.favoriteAriaAdd();
  }
}
