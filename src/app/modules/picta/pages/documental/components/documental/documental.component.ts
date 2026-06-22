import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, Renderer2, viewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { debounceTime } from 'rxjs';
import { DownloadPopupComponent } from '../../../../components/download-popup/download-popup.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthService } from '../../../../../../services/auth.service';
import { ListaReproduccionCanalService } from '../../../medias/services/lista-reproduccion-canal.service';
import { PositionServiceService } from '../../../categoria/services/position-service.service';
import { fromEvent, Subscription } from 'rxjs';
import { Publication } from '../../../medias/models/publicacion.model';
import { PictaResponse } from '../../../../models/response.picta.model';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor, MatButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-documental',
    templateUrl: 'documental.component.html',
    styleUrls: ['documental.component.scss'],
    imports: [
    RouterLink,
    MatIcon,
    MatAnchor,
    MatButton,
    MatTooltip
]
})
export class DocumentalComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private breakpointObserver = inject(BreakpointObserver);
  private bottomSheet = inject(MatBottomSheet);
  private listaReproduccionCanalService = inject(ListaReproduccionCanalService);
  authService = inject(AuthService);
  private positionService = inject(PositionServiceService);
  private renderer = inject(Renderer2);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private meta = inject(Meta);

  movie: Publication;
  videosRecomendados: Publication[];
  loggedIn: boolean;
  readonly heroImg = viewChild<ElementRef>('heroImg');
  coords: { x: number; y: number };
  innerWidth: number;
  innerHeigth: number;
  resizeObs: Subscription;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const platformId = this.platformId;

    if (isPlatformBrowser(platformId)) {
      this.innerWidth = window.innerWidth + 200;
      this.innerHeigth = window.innerHeight;
    }
    this.movie = this.route.snapshot.data['movie'][0];
    this.title.setTitle(this.movie.nombre);
    this.meta.updateTag({ name: 'description', content: this.movie.descripcion });
    this.meta.addTags([
      { name: 'twitter:card', content: this.movie.nombre },
      { name: 'og:url', content: `https://www.picta.cu/movie/${this.movie.slug_url}` },
      { name: 'og:image', content: `${this.movie.url_imagen}_1200x600` },
      { name: 'og:title', content: this.movie.nombre },
      { name: 'og:description', content: this.movie.descripcion },
      { name: 'og:image:width', content: '1200' },
      { name: 'og:image:height', content: '630' },
    ]);
    this.authService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
      if (user) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });
  }

  ngOnInit() {
    this.loadRecomendaciones();
    if (isPlatformBrowser(this.platformId)) {
      this.resizeObs = fromEvent(window, 'resize')
        .pipe(debounceTime(1000))
        .subscribe(evt => {
          this.innerWidth = window.innerWidth + 200;
          this.innerHeigth = window.innerHeight;
        });
    }
  }

  openDownload() {
    const ref = this.bottomSheet.open(DownloadPopupComponent, {
      data: { video: this.movie },
      panelClass: 'bottomSheet',
    });
  }

  ngAfterViewInit(): void {
    this.positionService.position.subscribe(value => {
      if (value) {
        this.coords = value;
        const heroImg = this.heroImg();
        this.renderer.setStyle(
          heroImg.nativeElement,
          'transform',
          `translate3d(${this.coords.x}px,${this.coords.y}px, 0)`
        );
        this.renderer.setStyle(heroImg.nativeElement, 'margin-top', '0');
        this.renderer.setStyle(heroImg.nativeElement, 'z-index', '2000');
        setTimeout(() => {
          const heroImgValue = this.heroImg();
          this.renderer.setStyle(
            heroImgValue.nativeElement,
            'transition',
            '.5s ease-in-out'
          );
          this.renderer.removeStyle(heroImgValue.nativeElement, 'transform');
          this.renderer.setStyle(heroImgValue.nativeElement, 'z-index', '0');
          this.renderer.setStyle(
            heroImgValue.nativeElement,
            'margin-top',
            '3rem'
          );
        }, 350);
      }
    });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.resizeObs.unsubscribe();
    }
  }

  goBack() {
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    }
  }

  private loadRecomendaciones() {
    this.listaReproduccionCanalService
      .getVideosRecomendados(this.movie.id)
      .subscribe((res: PictaResponse<Publication>) => {
        this.videosRecomendados = res.results;
      });
  }
}
