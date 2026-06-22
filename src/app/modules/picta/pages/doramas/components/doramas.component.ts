import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PictaResponse } from '../../../models/response.picta.model';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { Serie, Publication } from '../../medias/models/publicacion.model';
import { SerieService } from '../../categoria/services/serie.service';
import { PublicationService } from '../../medias/services/publication-service';
import { Title } from '@angular/platform-browser';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MatButtonToggleGroup,
  MatButtonToggle,
} from '@angular/material/button-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { SerieListComponent } from '../../categoria/components/serie-list/serie-list.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MyCarouseloComponent } from '../../common-components/components/my-carousel-o/my-carouselo.component';
import { CategoriaLoadingStateComponent } from '../../categoria/components/categoria-loading-state/categoria-loading-state.component';
import { SectionHeaderComponent } from '../../common-components/components/section-header/section-header.component';
import { LocalstorageService } from '../../../../../services/localstorage.service';
import { CarouselSkeletonComponent } from '../../common-components/components/carousel-skeleton/carousel-skeleton.component';

@Component({
  selector: 'app-doramas',
  imports: [
    MatProgressSpinner,
    MatSelect,
    MatOption,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatTooltip,
    MatIcon,
    MatButtonToggleGroup,
    MatButtonToggle,
    SerieListComponent,
    MyCarouseloComponent,
    CategoriaLoadingStateComponent,
    SectionHeaderComponent,
    CarouselSkeletonComponent,
  ],
  templateUrl: './doramas.component.html',
  styleUrl: './doramas.component.scss',
})
export class DoramasComponent {
  private serieService = inject(SerieService);
  private publicationService = inject(PublicationService);
  private title = inject(Title);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly localStorage = inject(LocalstorageService);

  private readonly doramasFavoritesStorageKey = 'picta.doramasFavorites';

  next: string;
  private loadSeries = inject(SerieService);

  searchControl = new UntypedFormControl('');
  paisControl = new UntypedFormControl('');

  // Carrusel de doramas actualizados recientemente
  readonly latestUpdatedDoramas = signal<Publication[]>([]);
  readonly loadingCarousel = signal<boolean>(true);

  // Señales para favoritos de doramas
  readonly favoriteDoramas = signal<Publication[]>([]);
  readonly isLoadingFavoriteDoramas = signal<boolean>(true);

  paises = [
    'Corea',
    'Japón',
    'China',
    'Taiwán',
    'EEUU',
    'España',
    'Francia',
    'Italia',
    'Reino Unido',
    'Alemania',
    'Canadá',
    'Australia',
    'Hong Kong',
    'Tailandia',
    'Singapur',
  ];

  filtersDoramas = {
    page: 1,
    page_size: 20,
    next: 1,
    ordering: '-fecha_creacion',
    nombre__contains: '',
    genero_raw: 'Dorama',
    pais: '',
    ano__in: '',
  };

  // Lista de años para el filtro
  anos = Array.from({ length: new Date().getFullYear() - 1969 }, (_, i) =>
    String(new Date().getFullYear() - i),
  );
  anoControl = new UntypedFormControl('');

  doramas: Serie[] = [];

  viewModeControl = new UntypedFormControl('card');

  loading = true;
  isLoadingMore = false;
  loadMore = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.title.setTitle(`Doramas - Picta`);

    // Cargar carrusel de doramas actualizados
    this.loadLatestUpdatedDoramas();

    // Cargar favoritos de doramas
    this.loadFavoriteDoramasCarousel();

    // Suscribirse a cambios en la URL
    this.route.queryParams.subscribe(params => {
      const pais = params['pais'] || '';
      const nombre = params['nombre'] || '';
      const ano = params['ano'] || '';

      // Actualizar controles sin disparar eventos
      this.paisControl.setValue(pais, { emitEvent: false });
      this.searchControl.setValue(nombre, { emitEvent: false });
      this.anoControl.setValue(ano, { emitEvent: false });

      // Actualizar filtros
      if (pais) {
        this.filtersDoramas.pais = pais;
      } else {
        delete this.filtersDoramas.pais;
      }
      if (nombre) {
        this.filtersDoramas.nombre__contains = '*' + nombre + '*';
      } else {
        delete this.filtersDoramas.nombre__contains;
      }
      if (ano) {
        this.filtersDoramas.ano__in = ano;
      } else {
        delete this.filtersDoramas.ano__in;
      }
      this.filtersDoramas.page = 1;
      this.filtersDoramas.next = 1;

      // Recargar datos con los filtros de URL
      this.loadData();
    });

    // Inicializar el formulario de búsqueda después de cargar datos
    this.initSearchForm();
  }

  private loadData(): void {
    this.loading = true;
    this.serieService.getAll(this.filtersDoramas).subscribe((response: any) => {
      this.doramas = response.results;
      this.filtersDoramas.page = response.next;
      this.filtersDoramas.next = response.next;
      this.loading = false;
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loading || this.isLoadingMore || !this.filtersDoramas.next) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition >= scrollThreshold) {
      this.filters();
    }
  }

  setOrder(order: string) {
    this.filtersDoramas.ordering = order;
    this.filtersDoramas.page = 1;
    this.filtersDoramas.next = 1;
    this.filters(true);
  }

  filters(replace = false) {
    if (this.filtersDoramas.next && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.loadMore = true;
      this.serieService.getAll(this.filtersDoramas).subscribe({
        next: (response: PictaResponse<Serie>) => {
          this.doramas = replace
            ? response.results
            : [...this.doramas, ...response.results];
          this.filtersDoramas.page = response.next;
          this.filtersDoramas.next = response.next;
        },
        error: () => {
          this.isLoadingMore = false;
          this.loadMore = false;
        },
        complete: () => {
          this.isLoadingMore = false;
          this.loadMore = false;
        },
      });
    }
  }

  private initSearchForm() {
    this.paisControl.valueChanges
      .pipe(
        tap(pais => {
          this.loading = true;
          if (pais) {
            this.filtersDoramas.pais = pais;
          } else {
            delete this.filtersDoramas.pais;
          }
          this.filtersDoramas.page = 1;
          this.filtersDoramas.next = 1;

          // Update URL
          this.updateUrl(pais, this.searchControl.value, this.anoControl.value);
        }),
        switchMap(() => this.loadSeries.getAll(this.filtersDoramas)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.doramas = response?.results || [];
        this.filtersDoramas.page = response?.next || 1;
        this.filtersDoramas.next = response?.next || 1;
        this.loading = false;
      });

    // Observador para año
    this.anoControl.valueChanges
      .pipe(
        tap(ano => {
          this.loading = true;
          if (ano) {
            this.filtersDoramas.ano__in = ano;
          } else {
            delete this.filtersDoramas.ano__in;
          }
          this.filtersDoramas.page = 1;
          this.filtersDoramas.next = 1;

          // Update URL
          this.updateUrl(this.paisControl.value, this.searchControl.value, ano);
        }),
        switchMap(() => this.loadSeries.getAll(this.filtersDoramas)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.doramas = response?.results || [];
        this.filtersDoramas.page = response?.next || 1;
        this.filtersDoramas.next = response?.next || 1;
        this.loading = false;
      });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        map(query => (query ? '*' + query + '*' : '')),
        tap(query => {
          if (query) {
            this.filtersDoramas.nombre__contains = query;
          } else {
            delete this.filtersDoramas.nombre__contains;
          }
          this.filtersDoramas.page = 1;
          this.filtersDoramas.next = 1;

          // Update URL
          this.updateUrl(
            this.paisControl.value,
            this.searchControl.value,
            this.anoControl.value,
          );
        }),
        distinctUntilChanged(),
        switchMap(query => this.loadSeries.getAll(this.filtersDoramas)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.doramas = response?.results || [];
        this.filtersDoramas.page = response?.next || 1;
        this.filtersDoramas.next = response?.next || 1;
        this.loading = false;
      });
  }

  private updateUrl(pais: string, nombre: string, ano: string): void {
    const queryParams: any = {};

    if (pais) {
      queryParams['pais'] = pais;
    }
    if (nombre) {
      queryParams['nombre'] = nombre;
    }
    if (ano) {
      queryParams['ano'] = ano;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: pais || nombre || ano ? 'merge' : '',
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    delete this.filtersDoramas.nombre__contains;
    this.filtersDoramas.page = 1;
    this.filtersDoramas.next = 1;
    this.updateUrl(this.paisControl.value, '', this.anoControl.value);
    this.filters();
  }

  private loadLatestUpdatedDoramas(): void {
    this.publicationService.getByDoramaLastUpdate().subscribe({
      next: (response: Publication[]) => {
        this.latestUpdatedDoramas.set(response || []);
        this.loadingCarousel.set(false);
      },
      error: () => {
        this.latestUpdatedDoramas.set([]);
        this.loadingCarousel.set(false);
      },
    });
  }

  showAllUpdatedDoramas() {
    this.router.navigate(['/doramas/recientes']);
  }

  // ==================== FAVORITOS ====================

  private getFavoriteDoramasIdsFromStorage(): number[] {
    const raw = this.localStorage.getItem(this.doramasFavoritesStorageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return (parsed as (number | string)[])
        .map(id => Number(id))
        .filter(id => Number.isFinite(id));
    } catch {
      return [];
    }
  }

  private sortDoramasByFavoriteOrder(
    doramas: Publication[],
    ids: number[],
  ): Publication[] {
    const sorted: Publication[] = [];
    for (const id of ids) {
      const found = doramas.find((d: any) => d.pelser_id === id || d.id === id);
      if (found) {
        sorted.push(found);
      }
    }
    return sorted;
  }

  private loadFavoriteDoramasCarousel(): void {
    const ids = this.getFavoriteDoramasIdsFromStorage();
    if (!ids.length) {
      this.favoriteDoramas.set([]);
      this.isLoadingFavoriteDoramas.set(false);
      return;
    }

    this.isLoadingFavoriteDoramas.set(true);
    this.loadFavoriteDoramasPage(ids, 1, []);
  }

  private loadFavoriteDoramasPage(
    ids: number[],
    page: number,
    collected: Publication[],
  ) {
    this.serieService
      .getAll({
        id__in: ids.join('__'),
        pelser_id__in: ids.join('__'),
        page_size: 10,
        page,
      })
      .subscribe({
        next: (response: any) => {
          const batch = Array.isArray(response?.results)
            ? response.results
            : [];
          const merged = [...collected, ...batch];
          const nextPage = this.resolveNextPage(response?.next);

          if (nextPage) {
            this.loadFavoriteDoramasPage(ids, nextPage, merged);
            return;
          }

          this.favoriteDoramas.set(
            this.sortDoramasByFavoriteOrder(merged, ids),
          );
          this.isLoadingFavoriteDoramas.set(false);
        },
        error: () => {
          this.favoriteDoramas.set([]);
          this.isLoadingFavoriteDoramas.set(false);
        },
      });
  }

  private resolveNextPage(nextUrl: string | null): number | null {
    if (!nextUrl) return null;
    try {
      const url = new URL(nextUrl);
      const page = url.searchParams.get('page');
      return page ? parseInt(page, 10) : null;
    } catch {
      return null;
    }
  }

  onFavoriteDoramaChanged(event: {
    type: 'movie' | 'series';
    key: number;
    isFavorite: boolean;
  }): void {
    const id = Number(event.key);
    const ids = this.getFavoriteDoramasIdsFromStorage();
    let newIds: number[];

    if (event.isFavorite) {
      if (!ids.includes(id)) {
        newIds = [id, ...ids];
      } else {
        newIds = ids;
      }
    } else {
      newIds = ids.filter(i => i !== id);
    }

    this.localStorage.setItem(
      this.doramasFavoritesStorageKey,
      JSON.stringify(newIds),
    );

    if (!event.isFavorite) {
      this.favoriteDoramas.update(current =>
        current.filter((d: any) => d.pelser_id !== id && d.id !== id),
      );
    } else {
      this.loadFavoriteDoramasCarousel();
    }
  }
}
