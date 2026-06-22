import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
  computed,
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { ShortNumbersPipe } from '../../../pipes/short-numbers.pipe';

@Component({
  selector: 'app-publication-reactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'publication-reactions',
  },
  template: `
    <div class="reaction-group">
      <!-- Like button -->
      <button
        #tooltipLike="matTooltip"
        (click)="onLikeClick()"
        [class.is-active]="liked()"
        [disabled]="likeLoading()"
        [matTooltip]="
          isLoggedIn() ? 'Me gusta' : 'Debes estar autenticado para votar'
        "
        aria-label="Me gusta"
        class="reaction-button reaction-button-left"
        mat-stroked-button
      >
        <div class="flex items-center justify-center gap-2">
          @if (likeLoading()) {
            <mat-progress-spinner
              diameter="18"
              mode="indeterminate"
              color="accent"
            ></mat-progress-spinner>
          } @else {
            <mat-icon>thumb_up</mat-icon>
          }
          <span>{{ likesDisplay() }}</span>
        </div>
      </button>

      <!-- Divider -->
      <div class="reaction-divider"></div>

      <!-- Dislike button -->
      <button
        #tooltipDislike="matTooltip"
        (click)="onDislikeClick()"
        [class.is-negative-active]="disliked()"
        [disabled]="dislikeLoading()"
        [matTooltip]="
          isLoggedIn()
            ? 'No me gusta'
            : 'Debes estar autenticado para votar'
        "
        aria-label="No me gusta"
        class="reaction-button reaction-button-right"
        mat-stroked-button
      >
        <div class="flex items-center justify-center gap-2">
          @if (dislikeLoading()) {
            <mat-progress-spinner
              diameter="18"
              mode="indeterminate"
              color="accent"
            ></mat-progress-spinner>
          } @else {
            <mat-icon>thumb_down</mat-icon>
          }
          <span>{{ dislikesDisplay() }}</span>
        </div>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .reaction-group {
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(232, 70, 46, 0.22);
      border-radius: 999px;
      background: var(--pub-color-surface);
      overflow: hidden;
    }

    .reaction-divider {
      width: 1px;
      align-self: stretch;
      background: rgba(255, 255, 255, 0.1);
    }

    .reaction-button {
      --mat-button-outlined-container-shape: 999px;
      --mat-button-outlined-outline-color: var(--pub-color-border);
      --mat-button-outlined-label-text-color: rgba(244, 247, 251, 0.92);
      --mat-button-outlined-state-layer-color: var(--pub-color-accent);
      --mat-button-outlined-ripple-color: rgba(232, 70, 46, 0.16);

      min-width: 0;
      height: 38px;
      padding: 0 0.95rem;
      background: var(--pub-color-surface);
      box-shadow: none;
      border: 0;
      border-radius: 0;
      transition:
        background-color var(--pub-fast) var(--pub-ease),
        border-color var(--pub-fast) var(--pub-ease),
        color var(--pub-fast) var(--pub-ease),
        transform var(--pub-fast) var(--pub-ease);
    }

    .reaction-button-left {
      border-top-left-radius: 999px;
      border-bottom-left-radius: 999px;
    }

    .reaction-button-right {
      border-top-right-radius: 999px;
      border-bottom-right-radius: 999px;
    }

    .reaction-button:hover {
      background: var(--pub-color-surface-hover);
      transform: translateY(-1px);
    }

    .reaction-button:active {
      transform: scale(0.97);
    }

    .reaction-button.is-active {
      background: rgba(232, 70, 46, 0.12);
      --mat-button-outlined-label-text-color: var(--pub-color-text);
    }

    .reaction-button.is-negative-active {
      background: rgba(90, 150, 230, 0.14);
      --mat-button-outlined-label-text-color: #f4f7fb;
    }

    .reaction-button .mat-icon {
      margin-right: 0.4rem;
      color: rgba(244, 247, 251, 0.82);
    }

    .reaction-button.is-active .mat-icon {
      color: var(--picta-yellow, #f3e628);
    }

    .reaction-button.is-negative-active .mat-icon {
      color: var(--pub-color-accent);
    }

    .reaction-button span {
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    /* Spinner inside button */
    .reaction-button mat-progress-spinner {
      width: 18px;
      height: 18px;
      vertical-align: middle;
      margin-right: 0.35rem;
    }

    /* Pulse animation on activate */
    @keyframes pub-like-pulse {
      0% {
        transform: scale(1);
      }
      40% {
        transform: scale(1.18);
      }
      100% {
        transform: scale(1);
      }
    }

    .reaction-button.is-active .mat-icon {
      animation: pub-like-pulse 260ms var(--pub-ease) forwards;
    }
  `,
  imports: [
    MatProgressSpinner,
    MatIcon,
    MatButton,
    MatTooltip,
    ShortNumbersPipe,
  ],
})
export class PublicationReactionsComponent {
  // Required inputs
  likes = input.required<number>();
  dislikes = input.required<number>();

  // Optional inputs with defaults - read-only, parent manages state
  isLoggedIn = input(false, { transform: booleanAttribute });
  liked = input(false, { transform: booleanAttribute });
  disliked = input(false, { transform: booleanAttribute });
  likeLoading = input(false, { transform: booleanAttribute });
  dislikeLoading = input(false, { transform: booleanAttribute });

  // Outputs - emit events for parent to handle
  like = output<void>();
  dislike = output<void>();

  // Computed displays using input signals (read-only)
  likesDisplay = computed(() =>
    this.likes() !== 0 ? this.likes() : 0,
  );
  dislikesDisplay = computed(() =>
    this.dislikes() !== 0 ? this.dislikes() : 0,
  );

  onLikeClick() {
    if (!this.isLoggedIn()) return;
    this.like.emit();
  }

  onDislikeClick() {
    if (!this.isLoggedIn()) return;
    this.dislike.emit();
  }
}