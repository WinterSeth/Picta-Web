import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * RadioStation type used across the app. Fields kept permissive to match
 * the icestats shape and avoid strict errors in the UI.
 */
export interface RadioStation {
  mount?: string;
  listeners?: number | string;
  listenurl?: string;
  server_description?: string;
  server_name?: string;
  bitrate?: number;
  // Common normalized fields used across the app (explicitly declared to
  // satisfy Angular template and TypeScript strict checks). These are
  // populated by RadioService.normalizeSource / mapping code in UI
  // components (id, name, imageUrl, description).
  id: string | number;
  name: string;
  imageUrl?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Normalize a listen URL for consumer components.
 * See modules/picta/services/radio.service.ts for rationale.
 */
export function normalizeListenUrl(input: string): string {
  if (!input) return input;

  let u: URL | null = null;
  try {
    u = new URL(input);
  } catch (e) {
    try {
      const candidate = 'https://' + input.replace(/^\/*/, '');
      u = new URL(candidate);
    } catch (e2) {
      return input;
    }
  }

  if (u) {
    try {
      u.protocol = 'https:';
      if (u.port === '8000') u.port = '';
      return u.href;
    } catch (e) {
      return input;
    }
  }

  return input;
}

const FAVORITES_KEY = 'picta:radio:favorites';

@Injectable({ providedIn: 'root' })
export class RadioService {
  private http = inject(HttpClient);

  // Playback HTMLAudio element (created lazily)
  private audio: HTMLAudioElement | null = null;

  // Signals
  private _currentId = signal<string | number | null>(null);
  readonly currentStationId = this._currentId;

  private _isPlaying = signal(false);
  readonly isPlayingSignal = this._isPlaying;

  private _volume = signal(1);
  private _muted = signal(false);
  readonly volume = this._volume;
  readonly muted = this._muted;

  // Favorites stored as a map for easy lookup and small JSON footprint
  private _favorites = signal<Record<string, true>>({});
  readonly favorites = computed(() => Object.keys(this._favorites()));

  // Default Icecast status endpoint (kept from module service)
  private readonly STATUS_URL = 'https://radio.picta.cu/status-json.xsl';

  constructor() {
    this.loadFavoritesFromStorage();
    // load persisted volume/muted if available
    try {
      const v = localStorage.getItem('picta:radio:volume');
      const m = localStorage.getItem('picta:radio:muted');
      if (v != null) this._volume.set(Number(v));
      if (m != null) this._muted.set(m === 'true');
    } catch (e) {
      // ignore
    }

    // keep volume in sync with audio element
    effect(() => {
      const v = this._volume();
      if (this.audio) this.audio.volume = this._muted() ? 0 : v;
    });
    // persist volume
    effect(() => {
      try {
        localStorage.setItem('picta:radio:volume', String(this._volume()));
        localStorage.setItem('picta:radio:muted', String(this._muted()));
      } catch (e) {
        // ignore storage errors
      }
    });
  }

  /* ----------------------- Playback API ----------------------- */
  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'none';
      this.audio.onended = () => {
        this._isPlaying.set(false);
        // clear current id on natural end
        this._currentId.set(null);
      };
      this.audio.onerror = ev => {
        console.error('Audio playback error', ev);
        this._isPlaying.set(false);
      };
    }
    return this.audio;
  }

  play(station: RadioStation) {
    try {
      if (!station?.listenurl) {
        console.warn('Attempt to play station without listenurl', station);
        return;
      }
      const url = normalizeListenUrl(station.listenurl as string);
      const audio = this.ensureAudio();
      if (audio.src !== url) {
        audio.src = url;
      }
      audio
        .play()
        .then(() => {
          this._isPlaying.set(true);
          this._currentId.set(
            station.mount ?? station.server_name ?? String(station.listenurl),
          );
        })
        .catch(err => {
          console.error('Audio play rejected', err);
          this._isPlaying.set(false);
        });
    } catch (e) {
      console.error('RadioService.play error', e);
      this._isPlaying.set(false);
    }
  }

  stop(station?: RadioStation) {
    try {
      if (!this.audio) return;
      // only stop if no station provided or it matches current
      if (
        !station ||
        this._currentId() ===
          (station.mount ?? station.server_name ?? String(station.listenurl))
      ) {
        this.audio.pause();
        // do not reset src to allow resuming in some browsers, but clear playing flag
        this._isPlaying.set(false);
        this._currentId.set(null);
      }
    } catch (e) {
      console.error('RadioService.stop error', e);
    }
  }

  select(station: RadioStation) {
    this._currentId.set(
      station?.mount ?? station.server_name ?? String(station.listenurl),
    );
  }

  isPlaying(station: RadioStation): boolean {
    return (
      this._isPlaying() &&
      this._currentId() ===
        (station?.mount ?? station?.server_name ?? String(station?.listenurl))
    );
  }

  setVolume(v: number) {
    const nv = Math.max(0, Math.min(1, v));
    this._volume.set(nv);
  }

  toggleMute() {
    this._muted.set(!this._muted());
  }

  /* ----------------------- Favorites ----------------------- */
  toggleFavorite(station: RadioStation) {
    const key = String(
      station?.mount ?? station?.server_name ?? station?.listenurl ?? '',
    );
    const favs = { ...this._favorites() };
    if (favs[key]) {
      delete favs[key];
    } else {
      favs[key] = true;
    }
    this._favorites.set(favs);
    this.saveFavoritesToStorage();
  }

  isFavorite(station: RadioStation): boolean {
    return !!this._favorites()[
      String(station?.mount ?? station?.server_name ?? station?.listenurl ?? '')
    ];
  }

  private loadFavoritesFromStorage() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw) as string[];
      const map: Record<string, true> = {};
      for (const k of arr) map[k] = true;
      this._favorites.set(map);
    } catch (e) {
      console.warn('Failed to load favorites from storage', e);
    }
  }

  private saveFavoritesToStorage() {
    try {
      const arr = Object.keys(this._favorites());
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to save favorites to storage', e);
    }
  }

  toJSON() {
    return { favorites: Object.keys(this._favorites()) };
  }

  rehydrate(payload: { favorites?: string[] } | null) {
    if (!payload) return;
    const map: Record<string, true> = {};
    for (const k of payload.favorites ?? []) map[k] = true;
    this._favorites.set(map);
    this.saveFavoritesToStorage();
  }

  /* ----------------------- Station fetching (from module service) ----------------------- */
  getStatus(): Observable<any> {
    return this.http.get<any>(this.STATUS_URL);
  }

  getStations(): Observable<RadioStation[]> {
    return this.getStatus().pipe(
      map(data => {
        const sources = data?.icestats?.source ?? [];
        const list = Array.isArray(sources) ? sources : [sources];
        return list.map((s: any) => this.normalizeSource(s));
      }),
    );
  }

  private normalizeSource(s: any): RadioStation {
    const rawListenUrl: string = s?.listenurl ?? s?.server_listening_url ?? '';
    const listenurl = normalizeListenUrl(rawListenUrl);

    let mount: string | undefined;
    try {
      const u = new URL(listenurl);
      mount = u.pathname.replace(/^\//, '');
    } catch (e) {
      const idx = rawListenUrl.lastIndexOf('/');
      if (idx !== -1) mount = rawListenUrl.substring(idx + 1);
    }

    const listeners = parseInt(s?.listeners ?? s?.listener_count ?? 0, 10) || 0;

    return {
      mount,
      listeners,
      listenurl,
      server_description: s?.server_description ?? s?.server_name,
      server_name: s?.server_name,
      bitrate: parseInt(s?.bitrate ?? s?.avg_bitrate ?? 0, 10) || undefined,
      ...s,
    } as RadioStation;
  }
}
