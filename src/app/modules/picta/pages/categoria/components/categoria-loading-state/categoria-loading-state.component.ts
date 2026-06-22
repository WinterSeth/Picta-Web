import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-categoria-loading-state',
  templateUrl: './categoria-loading-state.component.html',
  styleUrl: './categoria-loading-state.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class CategoriaLoadingStateComponent {
  readonly label = input.required<string>();
  readonly ariaLabel = input<string>('');
  readonly tone = input<'default' | 'movie' | 'serie' | 'documental' | 'musical' | 'live'>('default');
}