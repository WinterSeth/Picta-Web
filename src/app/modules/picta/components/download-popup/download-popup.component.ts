import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicationService } from '../../pages/medias/services/publication-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Publication } from '../../pages/medias/models/publicacion.model';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton, MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatActionList } from '@angular/material/list';
import { LocalstorageService } from '../../../../services/localstorage.service';
import { MatomoTracker } from 'ngx-matomo-client';

interface VideoDownload {
  id: string; // Identificador único de la descarga
  downloadLink: string; // Enlace de descarga
  expirationTime: number; // Tiempo de expiración en milisegundos
  type: 'subtitulo' | 'video'; // Tipo de descarga
  resolution?: 'pro' | 'high' | 'medium' | 'low'; // Resolución (solo para videos)
}

interface VideoInfo {
  visita: boolean; // Si el usuario visitó el video
  reproduccion: boolean; // Si el usuario le dio play al video
  downloads: { [key: string]: VideoDownload }; // Objeto de enlaces de descarga
}

interface Descarga {
  low?: string; // Propiedad opcional
  medium?: string; // Propiedad opcional
  high?: string; // Propiedad opcional
  pro?: string; // Propiedad opcional
}

interface QualityRow {
  id: string;
  key: 'pro' | 'high' | 'medium' | 'low';
  label: string;
  resolution: string;
  size: string;
  downloadId: string;
}

@Component({
  selector: 'app-download-popup',
  templateUrl: './download-popup.component.html',
  styleUrls: ['./download-popup.component.scss'],
  imports: [
    MatActionList,
    MatIcon,
    MatButton,
    MatProgressSpinner,
    MatAnchor,
    RouterLink,
    MatIconButton,
  ],
})
export class DownloadPopupComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  dialogRef = inject<MatDialogRef<DownloadPopupComponent>>(MatDialogRef);
  data = inject<{
    video: Publication;
    user: any;
  }>(MAT_DIALOG_DATA);

  private publicationService = inject(PublicationService);
  private snackBar = inject(MatSnackBar);
  private localStorage = inject(LocalstorageService);
  private matomo = inject(MatomoTracker);

  progreso: number = 0;
  contador: number;
  mostrandoProgreso: boolean = false;
  intervalo: any;
  generarTiempo_descarga: any;
  descargas: any;

  descargasRealizadas$ = this.publicationService.getDownloads();
  descargasRestantes = signal<number>(0);

  downloadLink: string | null = null; // Usar SafeUrl para la URL
  downloadExpiration: number | null = null; // Tiempo de expiración del enlace
  descargasDisponibles: number = 50; // Límite de descargas (ajusta según el plan del usuario)

  // Estados de carga
  generatingLink: boolean = false; // Estado para generar enlace
  downloading: boolean = false; // Estado para descargar archivo

  timeRemaining: string = ''; // Tiempo restante en formato legible
  calidad: any;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  get descarga(): Descarga {
    const descargaJSON = JSON.parse(this.data.video.descarga);
    const calidades: Descarga = {};

    for (const calidad in descargaJSON) {
      if (
        descargaJSON.hasOwnProperty(calidad) &&
        descargaJSON[calidad] &&
        descargaJSON[calidad].trim() !== ''
      ) {
        calidades[calidad as keyof Descarga] = descargaJSON[calidad];
      }
    }

    return calidades;
  }

  get isAudio() {
    return (
      this.data.video.categoria.audio ||
      this.data.video.categoria.tipologia.modelo === 'audio' ||
      this.data.video.categoria.cancion ||
      this.data.video.categoria.tipologia.modelo === 'cancion'
    );
  }

  ngOnInit() {
    this.checkDownloadLinkValidity();
    this.updateTimeRemaining();
    this.obtenertiempo_descarga();
    this.obtener_calidad();
    this.obtener_descarga();

    // Suscribirse a los cambios de descargas
    this.descargasRealizadas$.subscribe(value => {
      this.descargasRestantes.set(value);
    });
  }

  // Verificar si el enlace de descarga es válido
  checkDownloadLinkValidity(): void {
    const expiration = this.localStorage.getItem('downloadExpiration');
    if (expiration && Date.now() < expiration) {
      this.downloadLink = this.localStorage.getItem('downloadLink');
      this.downloadExpiration = expiration;
    } else {
      this.localStorage.removeItem('downloadLink');
      this.localStorage.removeItem('downloadExpiration');
    }
  }

  getTimeRemaining(downloadId: string): string {
    const videoInfo = this.getVideoInfo();
    const download = videoInfo.downloads[downloadId];

    if (download && download.expirationTime > Date.now()) {
      const timeRemaining = download.expirationTime - Date.now();
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
      );
      return `${hours}h ${minutes}m`;
    } else {
      return '';
    }
  }

  // Método para calcular el tiempo restante
  updateTimeRemaining(): void {
    if (this.downloadExpiration) {
      const now = Date.now();
      const remainingTime = this.downloadExpiration - now;

      if (remainingTime > 0) {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remainingTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        this.timeRemaining = `Disponible por ${hours}h ${minutes}m`;
      } else {
        this.timeRemaining = 'Enlace expirado';
      }
    } else {
      this.timeRemaining = '';
    }
  }

  // Descargar el archivo
  /*   downloadFile(): void {
    if (this.downloadLink) {
      this.downloading = true; // Activar estado de carga
      window.open(this.limpiarUrl(this.downloadLink), '_self'); // Abrir la URL en la misma pestaña
    }
  } */

  // Descargar un archivo
  downloadFile(downloadId: string): void {
    const videoInfo = this.getVideoInfo();
    const download = videoInfo.downloads[downloadId];

    if (download && download.expirationTime > Date.now()) {
      this.trackDownloadEvent(download.type, download.resolution || downloadId);
      this.runAfterTracking(() => {
        window.open(this.limpiarUrl(download.downloadLink), '_self'); // Abrir la URL en la misma pestaña
      });
    } else {
      alert('El enlace de descarga no es válido o ha expirado.');
    }
  }

  // Obtener la información del video desde el localStorage
  getVideoInfo(): VideoInfo {
    const videoInfo = this.localStorage.getItem(this.data.video.id);
    if (videoInfo) {
      const parsedInfo = JSON.parse(videoInfo);
      // Asegúrate de que la propiedad downloads esté definida
      if (!parsedInfo.downloads) {
        parsedInfo.downloads = {};
      }
      return parsedInfo;
    } else {
      // Si no existe, devuelve un objeto con downloads inicializado
      return { visita: false, reproduccion: false, downloads: {} };
    }
  }

  // Guardar la información del video en el localStorage
  saveVideoInfo(videoInfo: VideoInfo): void {
    // Asegúrate de que el objeto tenga la estructura correcta antes de guardarlo
    const infoToSave = {
      visita: videoInfo.visita,
      reproduccion: videoInfo.reproduccion,
      downloads: videoInfo.downloads || {}, // Inicializa downloads si no está definido
    };
    this.localStorage.setItem(this.data.video.id, JSON.stringify(infoToSave));
  }

  // Timer for delayed generation (10s)
  timerDuration: number = 10; // seconds
  timerRemaining: number = 0;
  timerInterval: any = null;
  timerActive: boolean = false;
  timerProgressValue: number = 0; // 0-100
  activeTimerId: string | null = null; // e.g. 'subtitulo' or 'video-high'
  preparing: boolean = false; // countdown active

  /**
   * Wrapper: when user clicks generate, start a 10s timer and then call the API.
   */
  generateDownloadLink(
    tipo: 'subtitulo' | 'video',
    key?: 'pro' | 'high' | 'medium' | 'low',
  ) {
    if (this.generatingLink || this.mostrandoProgreso) return;

    if (this.descargasDisponibles <= 0) {
      alert('Has alcanzado el límite de descargas permitidas por tu plan.');
      return;
    }

    const id = tipo === 'subtitulo' ? 'subtitulo' : `video-${key}`;

    // Check subscription benefit for timer. If 'No', generate immediately.
    const beneficio = this.generarTiempo_descarga;
    if (beneficio === 'No' || beneficio === null || beneficio === undefined) {
      // mark this item as active so spinner aligns with it
      this.activeTimerId = id;
      this.generatingLink = true;
      const params: any =
        tipo === 'video'
          ? { id: this.data.video.id, calidad: key, tipo }
          : { id: this.data.video.id, tipo };
      this.performGenerateDownloadLink(params, tipo, key);
      return;
    }

    // Otherwise parse the benefit as seconds and start timer
    const seconds = Number.parseInt(String(beneficio), 10);
    const duration = Number.isFinite(seconds) && seconds > 0 ? seconds : 10;
    this.startGenerateTimer(tipo, key, id, duration);
  }

  private startGenerateTimer(
    tipo: 'subtitulo' | 'video',
    key?: 'pro' | 'high' | 'medium' | 'low',
    id?: string,
    durationSeconds?: number,
  ) {
    this.timerDuration =
      durationSeconds && durationSeconds > 0 ? durationSeconds : 10;
    this.timerRemaining = this.timerDuration;
    this.timerProgressValue = 0;
    this.timerActive = true;
    this.preparing = true; // countdown state
    this.activeTimerId = id || null;

    this.timerInterval = setInterval(() => {
      this.timerRemaining -= 1;
      const elapsed = this.timerDuration - this.timerRemaining;
      this.timerProgressValue = Math.min(
        100,
        Math.round((elapsed / this.timerDuration) * 100),
      );

      if (this.timerRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.timerActive = false;
        this.preparing = false;
        // build params and call the real API method
        let params: any;
        if (tipo === 'video') {
          params = { id: this.data.video.id, calidad: key, tipo };
        } else {
          params = { id: this.data.video.id, tipo };
        }
        this.performGenerateDownloadLink(params, tipo, key);
      }
    }, 1000);
  }

  private performGenerateDownloadLink(
    params: any,
    tipo: 'subtitulo' | 'video',
    key?: 'pro' | 'high' | 'medium' | 'low',
  ) {
    this.generatingLink = true; // API in progress
    // keep activeTimerId until API finishes so UI shows spinner on the same item

    this.publicationService.getDownloadUrl(params).subscribe(
      (response: any) => {
        if (response.url_descarga) {
          this.downloadLink = this.limpiarUrl(response.url_descarga);
          this.downloadExpiration = Date.now() + 48 * 60 * 60 * 1000;
          this.localStorage.setItem(
            'downloadLink',
            JSON.stringify(this.downloadLink),
          );
          this.localStorage.setItem(
            'downloadExpiration',
            JSON.stringify(this.downloadExpiration),
          );
          this.descargasDisponibles--;
          this.updateTimeRemaining();

          const videoDownload: VideoDownload = {
            id: `${tipo}-${key || ''}`,
            downloadLink: this.downloadLink!,
            expirationTime: this.downloadExpiration!,
            type: tipo,
            resolution: tipo === 'video' ? key : undefined,
          };

          const videoInfo = this.getVideoInfo();
          videoInfo.downloads[videoDownload.id] = videoDownload;
          this.saveVideoInfo(videoInfo);
        }
        if (response.descargas) {
          this.descargasRealizadas$ = this.publicationService.getDownloads();
        }
        this.generatingLink = false;
        this.timerProgressValue = 0;
        this.timerRemaining = 0;
        this.activeTimerId = null;
      },
      error => {
        console.error('Error al generar el enlace de descarga:', error);
        this.generatingLink = false;
        this.timerActive = false;
        this.timerProgressValue = 0;
        this.timerRemaining = 0;
        this.preparing = false;
        this.activeTimerId = null;
      },
    );
  }

  quality(key) {
    switch (key) {
      case 'pro': {
        return '1080P';
      }
      case 'high': {
        return '720P';
      }
      case 'medium': {
        return '360P';
      }
      case 'low': {
        return '144P';
      }
      default:
        return 'Desconocido'; // 👈 Valor por defecto
    }
  }

  obtener_descarga() {
    const beneficioDescarga = this.data.user.subscription_plan?.beneficios.find(
      beneficio => beneficio.nombre_raw === 'descargas',
    );
    if (beneficioDescarga) {
      this.descargas = beneficioDescarga.valor;
    } else {
      this.descargas = 'No'; // Valor por defecto
    }
  }

  obtener_calidad() {
    const beneficioCalidad = this.data.user.subscription_plan?.beneficios.find(
      beneficio => beneficio.nombre_raw === 'calidad',
    );
    if (beneficioCalidad) {
      this.calidad = beneficioCalidad.valor;
    } else {
      this.calidad = '480p'; // Valor por defecto
    }
  }

  obtenertiempo_descarga() {
    const beneficioTiempoDescarga =
      this.data.user.subscription_plan?.beneficios.find(
        beneficio => beneficio.nombre_raw === 'tiempo_generar_descarga',
      );

    if (beneficioTiempoDescarga) {
      this.generarTiempo_descarga = beneficioTiempoDescarga.valor;
    } else {
      this.generarTiempo_descarga = '10'; // Valor por defecto
    }
  }

  iniciarDescarga(calidad: string) {
    this.mostrandoProgreso = true;
    this.progreso = 0;
    this.contador = 10;
    this.intervalo = setInterval(() => {
      this.contador--;
      this.progreso += 10;
      if (this.contador === 0) {
        clearInterval(this.intervalo);
        this.getDownloadURL('video', calidad);
      }
    }, 1000);
  }

  subtitleDownloadId(): string {
    return 'subtitulo-';
  }

  qualityRows(): QualityRow[] {
    if (this.isAudio) {
      return [];
    }

    const rows: QualityRow[] = [];
    const calidadDescarga = this.descarga;

    if (calidadDescarga.pro) {
      rows.push({
        id: 'pro',
        key: 'pro',
        label: '1080p',
        resolution: '1920x1080',
        size: calidadDescarga.pro,
        downloadId: 'video-pro',
      });
    }

    if (calidadDescarga.high) {
      rows.push({
        id: 'high',
        key: 'high',
        label: '720p',
        resolution: '1280x720',
        size: calidadDescarga.high,
        downloadId: 'video-high',
      });
    }

    if (calidadDescarga.medium) {
      rows.push({
        id: 'medium',
        key: 'medium',
        label: '360p',
        resolution: '640x360',
        size: calidadDescarga.medium,
        downloadId: 'video-medium',
      });
    }

    if (calidadDescarga.low) {
      rows.push({
        id: 'low',
        key: 'low',
        label: '144p',
        resolution: '256x144',
        size: calidadDescarga.low,
        downloadId: 'video-low',
      });
    }

    return rows;
  }

  remainingDownloads(): number {
    const total = Number(this.descargas);
    const used = Number(this.descargasRestantes());

    if (Number.isNaN(total) || Number.isNaN(used)) {
      return 0;
    }

    return Math.max(total - used, 0);
  }

  subtitleGenerateDisabled(): boolean {
    // Disabled when global generating OR showing progress OR preparing for this item
    if (this.mostrandoProgreso) return true;
    // If preparing or generating for the subtitle, disable
    if (this.preparing && this.activeTimerId === 'subtitulo') return true;
    if (this.generatingLink && this.activeTimerId === 'subtitulo') return true;
    return false;
  }

  videoGenerateDisabled(key: 'pro' | 'high' | 'medium' | 'low'): boolean {
    if (this.mostrandoProgreso || this.descargas === 'No') {
      return true;
    }

    // If preparing or generating for this specific video key
    const id = `video-${key}`;
    if (this.preparing && this.activeTimerId === id) return true;
    if (this.generatingLink && this.activeTimerId === id) return true;

    if (this.remainingDownloads() < 1) {
      return true;
    }

    if (key === 'pro' && this.calidad !== '1080p') {
      return true;
    }

    return false;
  }

  // Verificar si el enlace de descarga es válido
  isDownloadLinkValid(downloadId: string): boolean {
    const videoInfo = this.getVideoInfo();
    const download = videoInfo.downloads[downloadId];
    return download ? download.expirationTime > Date.now() : false;
  }

  getDownloadURL(tipo: string, key?: any) {
    this.mostrandoProgreso = false; // Lógica para iniciar la descarga del video console.log('Descargando video...');
    let params;
    if (tipo === 'video') {
      params = {
        id: this.data.video.id,
        calidad: key,
        tipo,
      };
    } else if (tipo === 'subtitulo') {
      params = {
        id: this.data.video.id,
        tipo,
      };
    }
    /*   if (this.platform.IOS) {
         this.snackBar.open('Generando enlace de descarga');
       }*/
    this.publicationService.getDownloadUrl(params).subscribe(
      async (res: any) => {
        const { url_descarga } = res;
        if (url_descarga) {
          /*  if (this.platform.IOS) {
            const dialog = this.dialog.open(DownloadLinkComponent, {
              data: {
                url_descarga
              }
            });
          } else {*/
          if (isPlatformBrowser(this.platformId)) {
            this.trackDownloadEvent(
              tipo as 'video' | 'subtitulo',
              key || 'directo',
            );
            this.runAfterTracking(() => window.open(url_descarga, '_self'));
          }
          /*   }*/
        }
      },
      error => {
        //console.log(error);
        this.snackBar.open(
          'Error al obtener el enlace. Intente otra vez. Error: ' +
            JSON.stringify(error.error.detail),
        );
      },
    );
  }

  // Método para limpiar el enlace de comillas dobles
  limpiarUrl(url: string): string {
    return url.replace(/"/g, ''); // Elimina todas las comillas dobles
  }

  private trackDownloadEvent(
    tipo: 'video' | 'subtitulo',
    detalle: string,
  ): void {
    const videoId = this.data?.video?.id;
    if (!videoId) {
      return;
    }
    const slug =
      this.data?.video?.slug_url || this.data?.video?.nombre || 'sin-slug';
    const label = `${videoId}:${slug}:${tipo}:${detalle}`;
    setTimeout(() => this.matomo.trackEvent('video', 'descarga', label), 0);
  }

  private runAfterTracking(action: () => void, delayMs = 300): void {
    setTimeout(() => action(), delayMs);
  }
}
