import { Component, inject, OnInit, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { RadioService, RadioStation, normalizeListenUrl } from '../../services/radio.service';
import { ListenerService } from '../../services/listener.service';
import { getImageSrcForStation } from '../../../../utils/radio-image.util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-radio-detail',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, FormsModule, MatSliderModule, NgFor, NgIf],
  templateUrl: './radio-detail.component.html',
  styleUrls: ['./radio-detail.component.scss'],
})
export class RadioDetailComponent implements OnInit, AfterViewInit {
  public route = inject(ActivatedRoute);
  private router = inject(Router);
  public radioService = inject(RadioService);
  private listenerService = inject(ListenerService);

  // Audio player refs and state (mirrors CubanradioComponent behavior)
  readonly audioElementRef = viewChild.required<ElementRef>('audioPlayer');
  audioElement: HTMLAudioElement;
  player: any;
  streamUrl = '';
  isPlaying = false;
  volume: number = 70;
  isMuted = false;
  previousVolume: number | undefined;
  private _onPlayBound: () => void;
  private _onPauseBound: () => void;

  mount: string | null = null;
  station: RadioStation | null = null;
  otherStations: RadioStation[] = [];

  // UI state
  showAutoplayPlayButton = false;

  private subs: Subscription[] = [];
  listenersCount: number = 0;
  private listenersSub: any;

  ngOnInit(): void {
    // react to param changes so clicking playlist items re-initializes
    this.subs.push(
      this.route.paramMap.subscribe(pm => {
        this.mount = (pm.get('mount') || '').toLowerCase();
        this.loadStationsAndPlay();
      }),
    );
  }

  ngAfterViewInit() {
    // If we already have a station loaded before the view init, ensure player is created
    if (this.station) {
      try {
        this.initPlayerForStation(this.station);
      } catch (e) {
        console.warn('init after view init error', e);
      }
    }
  }

  private loadStationsAndPlay() {
    // fetch stations and map similarly to RadioListComponent
    this.radioService.getStations().subscribe(list => {
      const mapped = list.map((s, idx) => {
        const mount = (s as any).mount ?? '';
        const id =
          (s as any).mount ??
          (s as any).server_name ??
          (s as any).listenurl ??
          String(idx);
        const name =
          (s as any).server_description ??
          (s as any).server_name ??
          (s as any).mount ??
          'Sin nombre';
        // Compute best image using centralized helper so detail view uses the
        // same logic as cards/list and benefits from name-based selection.
        let imageUrl = getImageSrcForStation(s as any);
        // Special-case Radio Reloj at mapping time so detail view also benefits
        const combinedName =
          (s as any).server_description ??
          (s as any).server_name ??
          (s as any).mount ??
          '';
        // Use centralized image selection where possible by delegating to util later.
        return {
          ...s,
          id,
          name,
          description: (s as any).server_description ?? (s as any).description,
          imageUrl,
        } as RadioStation & Record<string, any>;
      });

      // find current station by mount
      this.station =
        mapped.find(
          m => ((m.mount || '') as string).toLowerCase() === (this.mount || ''),
        ) ?? null;
      // fallback: try matching by id or server_name
      if (!this.station) {
        this.station =
          mapped.find(m => String(m.id).toLowerCase() === (this.mount || '')) ??
          null;
      }

      // Build playlist excluding current
      this.otherStations = mapped.filter(s => s !== this.station);

      // attempt autoplay if we have a station (use local player to mirror Cubanradio)
      if (this.station) {
        this.showAutoplayPlayButton = false;
        try {
          this.initPlayerForStation(this.station);
        } catch (e) {
          console.error('Autoplay attempt error', e);
        }

        // If after short delay playback didn't start, show manual play overlay
        setTimeout(() => {
          if (!this.isPlaying) {
            this.showAutoplayPlayButton = true;
          }
        }, 700);
      }
    });
  }

  onPlayButtonClick() {
    if (!this.station) return;
    this.showAutoplayPlayButton = false;
    // ensure player is initialized and toggle play
    if (!this.player) {
      this.initPlayerForStation(this.station);
      return;
    }
    this.togglePlay();
  }



  onPause() {
    if (!this.player) return;
    try { this.player.pause(); } catch(e) {}
  }

  togglePlay() {
    if (!this.player) { return; }
    if (this.player.paused) {
      const p = this.player.play();
      if (p && p.catch) { p.catch(() => {}); }
    } else {
      this.player.pause();
    }
  }

  toggleMute() {
    if (!this.player) { return; }

    if (this.player.muted) {
      // unmute and restore volume
      this.player.muted = false;
      if (this.previousVolume !== undefined) {
        this.player.volume = this.previousVolume;
        this.volume = Math.round(this.previousVolume * 100);
      } else {
        this.player.volume = Math.max(0, Math.min(1, this.volume / 100));
      }
    } else {
      // mute and remember volume
      this.previousVolume = this.player.volume;
      this.player.muted = true;
      this.volume = 0;
    }

    this.isMuted = !!this.player.muted;
  }

  onVolumeChange(event: any) {
    const newVolume = (typeof event === 'number') ? event : (event?.value ?? 0);
    this.volume = newVolume;
    if (!this.player) { return; }
    this.player.volume = Math.max(0, Math.min(1, this.volume / 100));

    // If volume > 0, ensure not muted
    if (this.volume > 0 && this.player.muted) {
      this.player.muted = false;
      this.isMuted = false;
    }
  }

  private initPlayerForStation(station: RadioStation | null) {
    if (!station) return;
    try {
      // Stop any shared RadioService audio to prevent duplicate playback
      try { this.radioService.stop(); } catch(e) {}

      this.player = this.audioElementRef().nativeElement as HTMLAudioElement;
      const url = (station.listenurl as string) || '';
      const normalized = normalizeListenUrl(url) || url;
      if (!this.player.src || !this.player.src.includes(normalized)) {
        this.player.src = normalized;
      }
      this.player.autoplay = true;
      // initialize volume from radioService if available
      try {
        this.volume = Math.round((this.radioService && this.radioService.volume ? this.radioService.volume() : (this.volume / 100)) * 100);
      } catch(e) {}
      this.player.volume = Math.max(0, Math.min(1, this.volume / 100));
      this.player.muted = (this.radioService && this.radioService.muted ? this.radioService.muted() : this.isMuted);
      this.player.load();
      const p = this.player.play();
      if (p && p.then) {
        p.then(() => {
          this.isPlaying = !this.player.paused;
        }).catch(() => {});
      }

      // attach listeners so UI reflects actual playback state
      this._onPlayBound = () => this.onAudioPlay();
      this._onPauseBound = () => this.onAudioPause();
      this.player.addEventListener('play', this._onPlayBound);
      this.player.addEventListener('pause', this._onPauseBound);
      this.player.addEventListener('ended', this._onPauseBound);

      // Start polling listeners for this station (20s interval)
      try {
        if (this.listenersSub) {
          try { this.listenersSub.unsubscribe(); } catch (e) {}
          this.listenersSub = null;
        }
        const streamKey = (station?.mount ?? station?.server_name ?? String(station?.listenurl ?? '')).toString();
        this.listenersSub = this.listenerService.pollListeners(streamKey, 20000).subscribe(n => this.listenersCount = n);
      } catch (e) {
        // ignore polling errors
      }
    } catch (e) {
      console.warn('audio init error', e);
    }
  }

  onAudioPlay() {
    this.isPlaying = true;
  }

  onAudioPause() {
    this.isPlaying = false;
  }

  // Format station name for lists: prefer explicit name unless it's 'Unspecified description',
  // otherwise use mount/server_name formatted (remove underscores, capitalize words).
  formatStationName(s: RadioStation | null): string {
    if (!s) return 'Estación';
    const name = (s.name ?? '').toString().trim();
    if (name && name.toLowerCase() !== 'unspecified description') {
      return name;
    }
    const mount = (s.mount ?? s.server_name ?? s.id ?? '').toString().trim();
    if (mount) {
      return mount.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Estación';
  }

  getStationDisplayName(): string {
    const name = this.station?.name?.trim();
    // Si el nombre es vacío, null, o 'Unspecified description', usar el mount formateado
    if (name && name.toLowerCase() !== 'unspecified description') {
      return name;
    }
    if (this.station?.mount && this.station.mount.trim() !== '') {
      // Reemplaza guion bajo por espacio y pone mayúscula inicial a cada palabra
      return this.station.mount
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Estación';
  }

  onMute() {
    if (!this.radioService.muted()) {
      this.radioService.toggleMute();
    }
  }

  onUnmute() {
    if (this.radioService.muted()) {
      this.radioService.toggleMute();
    }
  }

  onSelectFromPlaylist(s: RadioStation) {
    // Swap internally: set current station to selected and autoplay, reorder playlist
    if (!s) return;
    // If selected is already current, just ensure playing
    if (this.station && s.id === this.station.id) {
      try {
        this.radioService.play(this.station);
      } catch (e) {
        console.error('Error while trying to resume play', e);
      }
      return;
    }

    // Keep a reference to previous current
    const prev = this.station;

    // Set selected as current
    this.station = s;

    // Trigger playback of the newly selected station using local player
    try {
      this.initPlayerForStation(this.station);
    } catch (e) {
      console.error('Error while trying to play selected station', e);
    }

    // Reorder otherStations: move selected to top (remove it) and push previous current into list
    const idx = this.otherStations.findIndex(it => it.id === s.id);
    if (idx !== -1) this.otherStations.splice(idx, 1);
    if (prev) {
      // place previous current at the front of otherStations
      this.otherStations.unshift(prev);
    }
  }

  onImgError(event: Event) {
    const img = event?.target as HTMLImageElement | null;
    if (img && img.src && !img.src.endsWith('/img/default.webp')) {
      img.src = '/img/default.webp';
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    // cleanup player listeners and destroy audio element
    try {
      if (this.player) {
        try { this.player.pause(); } catch(e) {}
        if (this._onPlayBound) this.player.removeEventListener('play', this._onPlayBound);
        if (this._onPauseBound) this.player.removeEventListener('pause', this._onPauseBound);
        try {
          this.player.src = '';
          this.player.load();
        } catch(e) {}
        // Remove the audio element from the DOM if possible
        if (this.player.parentNode) {
          this.player.parentNode.removeChild(this.player);
        }
        this.player = null;
      }
    } catch (e) {}
    // stop listeners polling
    try {
      if (this.listenersSub) { this.listenersSub.unsubscribe(); this.listenersSub = null; }
    } catch (e) {}
  }
}
