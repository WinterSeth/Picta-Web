import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { RadioService } from '../../services/radio.service';

@Component({
  selector: 'app-volume-control',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatButtonModule, MatSliderModule],
  templateUrl: './volume-control.component.html',
  styleUrls: ['./volume-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeControlComponent {
  private radio = inject(RadioService);

  // Expose the service volume signal directly to template via getter
  get volume() {
    return this.radio.volume;
  }

  get muted() {
    return this.radio.muted ? this.radio.muted() : false;
  }

  setVolume(v: number) {
    this.radio.setVolume(Number(v));
  }

  toggleMute() {
    if (typeof this.radio.toggleMute === 'function') this.radio.toggleMute();
  }
}
