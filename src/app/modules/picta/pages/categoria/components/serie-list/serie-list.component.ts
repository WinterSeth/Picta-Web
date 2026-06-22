import { Component, inject, Inject, PLATFORM_ID, input } from '@angular/core';
import { PositionServiceService } from '../../services/position-service.service';
import { Serie } from '../../../medias/models/publicacion.model';
import { MatDialog } from '@angular/material/dialog';
import { TemporadaService } from '../../services/temporada.service';
import { PublicationService } from '../../../medias/services/publication-service';
import { NgOptimizedImage } from '@angular/common';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  MatNavList,
  MatListItem,
  MatListItemAvatar,
  MatListItemTitle,
  MatListItemLine,
  MatListItemIcon,
} from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { EmbedComponent } from '../../../../../embed/components/embed/embed.component';
import { VideoInfoDialogComponent } from '../../../../components/dialogs/video-info-dialog/video-info-dialog.component';
import { SerieCardComponent } from '../serie-card/serie-card.component';
import { modalScaleInAnimation } from '../../../../animations/dialogs';

const PLAY = `<svg _ngcontent-ng-c4275058749="" xmlns="http://www.w3.org/2000/svg" width="45px" height="45px" viewBox="0 -960 960 960" fill="#e8eaed" class="cursor-pointer focus:outline-none focus:fill-red-900 transition-colors duration-300 ease-in-out hover:fill-yellow-500 hover:stroke-yellow-500 stroke-black stroke-2 fill-white"><path _ngcontent-ng-c4275058749="" d="M382-306.67 653.33-480 382-653.33v346.66ZM480-80q-82.33 0-155.33-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.67T80-480q0-83 31.5-156t85.83-127q54.34-54 127.34-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82.33-31.5 155.33-31.5 73-85.5 127.34Q709-143 636-111.5T480-80Zm0-66.67q139.33 0 236.33-97.33t97-236q0-139.33-97-236.33t-236.33-97q-138.67 0-236 97-97.33 97-97.33 236.33 0 138.67 97.33 236 97.33 97.33 236 97.33ZM480-480Z"></path></svg>`;
const INFO = `<svg _ngcontent-ng-c4275058749="" xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#e8eaed" class="cursor-pointer focus:outline-none focus:fill-red-900 transition-colors duration-200 ease-in-out hover:fill-yellow-500 hover:stroke-yellow-500 stroke-black stroke-2 fill-white"><path _ngcontent-ng-c4275058749="" d="M448.67-280h66.66v-240h-66.66v240Zm31.32-316q15.01 0 25.18-9.97 10.16-9.96 10.16-24.7 0-15.3-10.15-25.65-10.16-10.35-25.17-10.35-15.01 0-25.18 10.35-10.16 10.35-10.16 25.65 0 14.74 10.15 24.7 10.16 9.97 25.17 9.97Zm.19 516q-82.83 0-155.67-31.5-72.84-31.5-127.18-85.83Q143-251.67 111.5-324.56T80-480.33q0-82.88 31.5-155.78Q143-709 197.33-763q54.34-54 127.23-85.5T480.33-880q82.88 0 155.78 31.5Q709-817 763-763t85.5 127Q880-563 880-480.18q0 82.83-31.5 155.67Q817-251.67 763-197.46q-54 54.21-127 85.84Q563-80 480.18-80Zm.15-66.67q139 0 236-97.33t97-236.33q0-139-96.87-236-96.88-97-236.46-97-138.67 0-236 96.87-97.33 96.88-97.33 236.46 0 138.67 97.33 236 97.33 97.33 236.33 97.33ZM480-480Z"></path></svg>`;

@Component({
  selector: 'app-serie-list',
  templateUrl: './serie-list.component.html',
  styleUrls: ['./serie-list.component.scss'],
  animations: [modalScaleInAnimation],
  imports: [
    RouterLink,
    MatIcon,
    MatNavList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    MatListItemIcon,
    NgOptimizedImage,
    SerieCardComponent,
  ],
})
export class SerieListComponent {
  private positionServiceService = inject(PositionServiceService);
  private dialog = inject(MatDialog);
  private temporadaService = inject(TemporadaService);
  private publicationService = inject(PublicationService);
  @Inject(PLATFORM_ID) private platformId: string;

  readonly series = input<Serie[]>(undefined);
  readonly mode = input('card');
  readonly baseRoute = input<string>('/categoria/Serie');

  innerWidth: number;
  innerHeigth: number;

  readonly video = input<any>(undefined);
  colorplay = 'primary';
  colorinfo = 'primary';
  colortrailer = 'primary';
  trailerURL: any;
  showLayerFlag = false;

  showLayer(event: MouseEvent) {
    this.showLayerFlag = true;
    const cardSerie = event.target as HTMLElement;
    const serieId = cardSerie.getAttribute('id');
    this.temporadaService
      .getAll({
        serie_pelser_id: serieId,
        ordering: 'nombre',
      })
      .subscribe(async (response: any) => {
        const temporadaTrailer = response.results.find(
          temporada => temporada.nombre === 'Trailer',
        );
        if (temporadaTrailer) {
          const trailer: any = await this.getVideoUrl(temporadaTrailer.id);
        } else {
          this.trailerURL = undefined;
        }
      });
  }

  async getVideoUrl(videoId: number): Promise<string> {
    let videoData;
    this.publicationService
      .getPublications({
        temporada_id: videoId,
        ordering: 'nombre',
      })
      .subscribe((res: any) => {
        videoData = res.results[0];
        this.trailerURL = videoData;
      });
    return videoData;
  }

  hideLayer(): void {
    this.showLayerFlag = false;
  }

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    // Note that we provide the icon here as a string literal here due to a limitation in
    // Stackblitz. If you want to provide the icon from a URL, you can use:
    // `iconRegistry.addSvgIcon('thumbs-up', sanitizer.bypassSecurityTrustResourceUrl('icon.svg'));`
    iconRegistry.addSvgIconLiteral(
      'play',
      sanitizer.bypassSecurityTrustHtml(PLAY),
    );
    iconRegistry.addSvgIconLiteral(
      'info',
      sanitizer.bypassSecurityTrustHtml(INFO),
    );
  }

  openTrailer() {
    let videoWidth = this.innerWidth;
    if (videoWidth > 800) {
      videoWidth = this.innerWidth / 2;
    }
    const dialogRef = this.dialog.open(EmbedComponent, {
      maxWidth: videoWidth,
      enterAnimationDuration: '100ms',
      exitAnimationDuration: '100ms',
      data: {
        video: this.trailerURL.slug_url,
      },
    });
  }

  videoInfoDialog(): void {
    this.dialog.open(VideoInfoDialogComponent);
  }

  setCoords(serie: Serie) {
    const card = document.querySelector(`#card${serie.pelser_id}`);
    this.positionServiceService.position.next({
      x: card.getBoundingClientRect().left,
      y: card.getBoundingClientRect().top,
    });
  }
}
