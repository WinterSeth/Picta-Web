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
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-animes',
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
    NgIf
  ],
  templateUrl: './animes.component.html',
  styleUrl: './animes.component.scss',
})
export class AnimesComponent {
  private serieService = inject(SerieService);
  private publicationService = inject(PublicationService);
  private title = inject(Title);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly localStorage = inject(LocalstorageService);

  private readonly animesFavoritesStorageKey = 'picta.animesFavorites';

  // Señales para favoritos de animes
  readonly favoriteAnimes = signal<Publication[]>([]);
  readonly isLoadingFavoriteAnimes = signal<boolean>(true);

  next: string;
  private loadSeries = inject(SerieService);

  searchControl = new UntypedFormControl('');
  paisControl = new UntypedFormControl('');

  // Carrusel de animes actualizados recientemente
  readonly latestUpdatedAnimes = signal<Publication[]>([]);
  readonly loadingCarousel = signal<boolean>(true);

  paises = [
    'Japón',
    'Corea',
    'China',
    'EEUU',
    'España',
    'Francia',
    'Italia',
    'Reino Unido',
    'Alemania',
    'Canadá',
    'Australia',
    'Taiwán',
    'Hong Kong',
  ];

  filtersAnimes = {
    page: 1,
    page_size: 20,
    next: 1,
    ordering: '-fecha_creacion',
    nombre__contains: '',
    genero_raw: 'Anime',
    pais: '',
    ano__in: '',
  };

  // Lista de años para el filtro
  anos = Array.from({ length: new Date().getFullYear() - 1969 }, (_, i) =>
    String(new Date().getFullYear() - i),
  );
  anoControl = new UntypedFormControl('');

  animes: Serie[] = [];

  viewModeControl = new UntypedFormControl('card');

  loading = true;
  isLoadingMore = false;
  loadMore = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.title.setTitle(`Animes - Picta`);

    // Cargar carrusel de animes actualizados
    this.loadLatestUpdatedAnimes();

    // Cargar carrusel de favoritos de animes
    this.loadFavoriteAnimesCarousel();

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
        this.filtersAnimes.pais = pais;
      } else {
        delete this.filtersAnimes.pais;
      }
      if (nombre) {
        this.filtersAnimes.nombre__contains = '*' + nombre + '*';
      } else {
        delete this.filtersAnimes.nombre__contains;
      }
      if (ano) {
        this.filtersAnimes.ano__in = ano;
      } else {
        delete this.filtersAnimes.ano__in;
      }
      this.filtersAnimes.page = 1;
      this.filtersAnimes.next = 1;

      // Recargar datos con los filtros de URL
      this.loadData();
    });

    // Inicializar el formulario de búsqueda después de cargar datos
    this.initSearchForm();
  }

  private loadData(): void {
    this.loading = true;
    this.serieService.getAll(this.filtersAnimes).subscribe((response: any) => {
      this.animes = response.results;
      this.filtersAnimes.page = response.next;
      this.filtersAnimes.next = response.next;
      this.loading = false;
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loading || this.isLoadingMore || !this.filtersAnimes.next) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition >= scrollThreshold) {
      this.filters();
    }
  }

  setOrder(order: string) {
    this.filtersAnimes.ordering = order;
    this.filtersAnimes.page = 1;
    this.filtersAnimes.next = 1;
    this.filters(true);
  }

  filters(replace = false) {
    if (this.filtersAnimes.next && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.loadMore = true;
      this.serieService.getAll(this.filtersAnimes).subscribe({
        next: (response: PictaResponse<Serie>) => {
          this.animes = replace
            ? response.results
            : [...this.animes, ...response.results];
          this.filtersAnimes.page = response.next;
          this.filtersAnimes.next = response.next;
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
            this.filtersAnimes.pais = pais;
          } else {
            delete this.filtersAnimes.pais;
          }
          this.filtersAnimes.page = 1;
          this.filtersAnimes.next = 1;

          // Update URL
          this.updateUrl(pais, this.searchControl.value, this.anoControl.value);
        }),
        switchMap(() => this.loadSeries.getAll(this.filtersAnimes)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.animes = response?.results || [];
        this.filtersAnimes.page = response?.next || 1;
        this.filtersAnimes.next = response?.next || 1;
        this.loading = false;
      });

    // Observador para año
    this.anoControl.valueChanges
      .pipe(
        tap(ano => {
          this.loading = true;
          if (ano) {
            this.filtersAnimes.ano__in = ano;
          } else {
            delete this.filtersAnimes.ano__in;
          }
          this.filtersAnimes.page = 1;
          this.filtersAnimes.next = 1;

          // Update URL
          this.updateUrl(this.paisControl.value, this.searchControl.value, ano);
        }),
        switchMap(() => this.loadSeries.getAll(this.filtersAnimes)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.animes = response?.results || [];
        this.filtersAnimes.page = response?.next || 1;
        this.filtersAnimes.next = response?.next || 1;
        this.loading = false;
      });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        map(query => (query ? '*' + query + '*' : '')),
        tap(query => {
          if (query) {
            this.filtersAnimes.nombre__contains = query;
          } else {
            delete this.filtersAnimes.nombre__contains;
          }
          this.filtersAnimes.page = 1;
          this.filtersAnimes.next = 1;

          // Update URL
          this.updateUrl(
            this.paisControl.value,
            this.searchControl.value,
            this.anoControl.value,
          );
        }),
        distinctUntilChanged(),
        switchMap(query => this.loadSeries.getAll(this.filtersAnimes)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.animes = response?.results || [];
        this.filtersAnimes.page = response?.next || 1;
        this.filtersAnimes.next = response?.next || 1;
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
    delete this.filtersAnimes.nombre__contains;
    this.filtersAnimes.page = 1;
    this.filtersAnimes.next = 1;
    this.updateUrl(this.paisControl.value, '', this.anoControl.value);
    this.filters();
  }

  private loadLatestUpdatedAnimes(): void {
    this.publicationService.getByAnimeLastUpdate().subscribe({
      next: (response: Publication[]) => {
        this.latestUpdatedAnimes.set(response || []);
        this.loadingCarousel.set(false);
      },
      error: () => {
        this.latestUpdatedAnimes.set([]);
        this.loadingCarousel.set(false);
      },
    });
  }

  showAllUpdatedAnimes() {
    this.router.navigate(['/animes/recientes']);
  }

  // ==================== FAVORITOS ====================

  private getFavoriteAnimesIdsFromStorage(): number[] {
    const raw = this.localStorage.getItem(this.animesFavoritesStorageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      // Convertir a números para asegurar comparación correcta
      return (parsed as (number | string)[]).map(id => Number(id)).filter(id => Number.isFinite(id));
    } catch {
      return [];
    }
  }

  private sortAnimesByFavoriteOrder(animes: Publication[], ids: number[]): Publication[] {
    const sorted: Publication[] = [];
    for (const id of ids) {
      // Buscar por pelser_id porque eso es lo que guardamos en storage
      const found = animes.find((a: any) => a.pelser_id === id || a.id === id);
      if (found) {
        sorted.push(found);
      }
    }
    return sorted;
  }

  private loadFavoriteAnimesCarousel(): void {
    const ids = this.getFavoriteAnimesIdsFromStorage();
    if (!ids.length) {
      this.favoriteAnimes.set([]);
      this.isLoadingFavoriteAnimes.set(false);
      return;
    }

    this.isLoadingFavoriteAnimes.set(true);
    this.loadFavoriteAnimesPage(ids, 1, []);
  }

  private loadFavoriteAnimesPage(
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
          const batch = Array.isArray(response?.results) ? response.results : [];
          const merged = [...collected, ...batch];
          const nextPage = this.resolveNextPage(response?.next);

          if (nextPage) {
            this.loadFavoriteAnimesPage(ids, nextPage, merged);
            return;
          }

          this.favoriteAnimes.set(
            this.sortAnimesByFavoriteOrder(merged, ids),
          );
          this.isLoadingFavoriteAnimes.set(false);
        },
        error: () => {
          this.favoriteAnimes.set([]);
          this.isLoadingFavoriteAnimes.set(false);
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

  onFavoriteAnimeChanged(event: { type: 'movie' | 'series'; key: number; isFavorite: boolean }): void {
    const id = Number(event.key); // Asegurar que sea número
    const ids = this.getFavoriteAnimesIdsFromStorage();
    let newIds: number[];

    if (event.isFavorite) {
      if (!ids.includes(id)) {
        newIds = [id, ...ids];
      } else {
        newIds = ids;
      }
    } else {
      // Eliminar solo del storage de animes
      newIds = ids.filter(i => i !== id);
    }

    this.localStorage.setItem(this.animesFavoritesStorageKey, JSON.stringify(newIds));

    if (!event.isFavorite) {
      // Filtrar por pelser_id (que es lo que guardamos) o id
      this.favoriteAnimes.update(current =>
        current.filter((a: any) => Number(a.pelser_id) !== id && Number(a.id) !== id),
      );
    } else {
      // Recargar para obtener el anime completo
      this.loadFavoriteAnimesCarousel();
    }
  }
}
