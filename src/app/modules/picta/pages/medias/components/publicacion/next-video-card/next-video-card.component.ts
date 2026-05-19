import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-next-video-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
template: `
    <div class="next-video-overlay" 
         [style.display]="visible() ? 'flex' : 'none'"
         role="dialog"
         aria-modal="true"
         [attr.aria-label]="autoPlay() ? 'Próximo video en ' + countdown() + ' segundos' : 'Reproducir siguiente video'">
      
      <!-- Timer a la izquierda (solo si autoPlay está activado) -->
      @if (autoPlay()) {
        <div class="next-video-timer">
          <div class="timer-circle-lg">
            <svg viewBox="0 0 100 100">
              <circle class="timer-ring-bg" cx="50" cy="50" r="45"/>
              <circle class="timer-ring-progress" cx="50" cy="50" r="45"/>
            </svg>
            <div class="timer-inner">
              <span class="timer-number-lg">{{ countdown() }}</span>
              <span class="timer-label">seg</span>
            </div>
          </div>
        </div>

        <!-- Flecha separadora entre timer y card -->
        <div class="next-video-separator">
          <div class="separator-line"></div>
          <div class="separator-icon">
            <mat-icon>arrow_forward</mat-icon>
          </div>
          <div class="separator-line"></div>
        </div>
      }

      <!-- Card a la derecha -->
      <div class="next-video-card">
        <div class="next-video-thumbnail">
          <img [src]="thumbnail()" [alt]="title()" loading="lazy">
        </div>
        <div class="next-video-content">
          <span class="next-video-label">{{ label() }}</span>
          <h4 class="next-video-title">{{ title() }}</h4>
          @if (meta()) {
            <p class="next-video-meta">{{ meta() }}</p>
          }
        </div>
        <button (click)="onPlay()" mat-raised-button class="next-video-btn">
          <mat-icon>play_arrow</mat-icon>
          <span>{{ buttonText() }}</span>
        </button>
      </div>

      <!-- Botón cerrar -->
      <button (click)="onClose()" class="next-video-close-btn">
        <mat-icon>close</mat-icon>
        <span>cerrar</span>
      </button>
    </div>
  `,
  styleUrl: './next-video-card.component.scss'
})
export class NextVideoCardComponent {
  visible = input<boolean>(false);
  autoPlay = input<boolean>(true);
  thumbnail = input<string>('');
  title = input<string>('');
  meta = input<string>('');
  label = input<string>('Siguiente');
  buttonText = input<string>('Reproducir');
  countdown = input<number>(10);
  
  close = output<void>();
  play = output<void>();

  onClose() {
    this.close.emit();
  }

  onPlay() {
    this.play.emit();
  }
}