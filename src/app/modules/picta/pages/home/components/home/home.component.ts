import { PublicationService } from '../../../medias/services/publication-service';
import { Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { SectionService } from '../../services/section.service';
import { SubSink } from 'subsink';
import { Section } from '../../models/section.model';
import { Meta, Title } from '@angular/platform-browser';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../../../../../services/auth.service';
import { UserModel } from '../../../../models/user.model';
import { SubscriptionService } from '../../../../../../services/subscription.service';
import { Publication } from '../../../medias/models/publicacion.model';
import { isPlatformBrowser } from '@angular/common';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { PortadaCarouselComponent } from '../../../common-components/components/portada-carousel/portada-carousel.component';
import { MyCarouseloComponent } from '../../../common-components/components/my-carousel-o/my-carouselo.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { CategoriaLoadingStateComponent } from '../../../categoria/components/categoria-loading-state/categoria-loading-state.component';
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
  imports: [PortadaCarouselComponent, MyCarouseloComponent, MatProgressSpinner, CategoriaLoadingStateComponent]
})

export class HomeComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private publicationService = inject(PublicationService);
  private sectionService = inject(SectionService);
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private subscribeService = inject(SubscriptionService);
  private meta = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  newSections: Array<Section> = [];
  next = 1;
  isRequesting = false;
  user: UserModel;
  subs = new SubSink();
  subscriptions: any;
  isLoading: boolean = true;

  serieOption: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      760: {
        items: 3,
      },
      1000: {
        items: 4,
      },
      1600: {
        items: 5,
      },
    },
    nav: true,
  };

  readonly homeCarouselOptions: Partial<OwlOptions> = {
    responsive: {
      0: { items: 2.1 },
      400: { items: 3.1 },
      768: { items: 3.2 },
      1024: { items: 4.2 },
      1280: { items: 5.1 },
      1536: { items: 6.1 },
    },
  };
  loadMore: boolean = false;
  private hasTriggeredBottomLoad = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    
    this.authService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
      if (user) {
        this.user = user;
        //this.initSubscription();
      } else {
        this.user = null;
        this.subscriptions = [];
      }
    })
  }

  ngOnInit() {
    this.loadSections();
    this.title.setTitle('Picta | Dale Play!');
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isRequesting || this.next === null) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;
    const isNearBottom = scrollPosition >= scrollThreshold;

    if (!isNearBottom) {
      this.hasTriggeredBottomLoad = false;
      return;
    }

    if (!this.hasTriggeredBottomLoad) {
      this.hasTriggeredBottomLoad = true;
      this.loadSections();
    }
  }

/*   initSubscription() {
    this.subs.add(
      this.subscribeService.getSubscriptionsByUserOnly({usuarioNombre: this.user.username}).subscribe((res: any) => {
        this.subscriptions = res.results;
      })
    );
  } */

  loadSections() {
    if (this.next === null || this.isRequesting) {
      return;
    }

    this.isRequesting = true;
    this.sectionService.getSecciones(this.next).subscribe((response: any) => {
      this.newSections = [...this.newSections, ...response.results];
      this.next = response.next;

      if (isPlatformBrowser(this.platformId)) {
        const pendingSections = (response.results as Section[] || []).filter((section: Section) => !section.videos);
        if (pendingSections.length) {
          this.loadPublicationsBySection(pendingSections, () => {
            this.isRequesting = false;
            this.isLoading = false;
          });
          return;
        } else {
          this.isLoading = false;
        }
      }

      this.isRequesting = false;
    }, () => {
      this.isRequesting = false;
      this.isLoading = false;
    });
  }

  continueWatching() {
    const keys = [];
    let limit = 0
    for (let i = 0; i < localStorage.length; i++) {
      if (limit >= 10) {
        break; // Detiene el bucle si limit es igual a 10
      }
      const key = localStorage.key(i);
      if (key && key.length > 12) {
        keys.push(key);
        limit++;
      }
    }
    if (keys.length > 0) {
      const data: any = { nombre: 'Continuar Viendo', estilo: 'carrusel', filtros: [{ key: 'slug_url_raw__in', value: keys.join('__') }] };
      this.newSections.splice(1, 0, data);
    }
  }

  recents() {
    const keys = [];
    for (let i = 0; i < this.subscriptions.length; i++) {
        keys.push(this.subscriptions[i].canal.nombre);
    }
    const filters = []
    if (keys.length > 0) {
      filters.push({ key: 'canal_nombre_raw__in', value: keys.join('__') })
    }
    const data: any = { nombre: 'Lo más reciente', estilo: 'carrusel', filtros: filters };
      this.newSections.splice(1, 0, data);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadDataSection(section: Section) {
    if (section.next !== null) {
      this.subs.add(
        this.publicationService.getByFiltros(section.filtros, section.next).subscribe((response: any) => {
            response.results.forEach((item: Publication) => section.videos.push(item));
            section.next = response.next;
          })
      );
    }
  }

  getSubscription(id: any) {
    return this.subscriptions ? this.subscriptions.find(s => s.canal.id === id) : null;
  }

  private loadPublicationsBySection(sections: Section[], onComplete?: () => void) {
    const pendingSections = sections.filter((section: Section) => !section.videos);

    if (!pendingSections.length) {
      onComplete?.();
      return;
    }

    let pendingCount = pendingSections.length;
    pendingSections.forEach((section: Section) => {
      this.publicationService.getByFiltros(section.filtros).pipe(
        finalize(() => {
          pendingCount -= 1;
          if (pendingCount === 0) {
            onComplete?.();
          }
        })
      ).subscribe((response: any) => {
        section.videos = response.results;
        section.next = response.next;
        if (section.filtros.filter((filter: { key: string; value: string }) => filter.key == 'canal_nombre_raw').length > 0) {
          section.canal = section.videos[0]?.canal;
        }
      });
    });
  }
}
