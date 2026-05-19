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
import { NgIf } from '@angular/common';
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
import { CarouselSkeletonComponent } from '../../common-components/components/carousel-skeleton/carousel-skeleton.component';

@Component({
  selector: 'app-novelas',
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
  templateUrl: './novelas.component.html',
  styleUrl: './novelas.component.scss',
})
export class NovelasComponent {
  private serieService = inject(SerieService);
  private publicationService = inject(PublicationService);
  private title = inject(Title);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  next: string;
  private loadSeries = inject(SerieService);

  searchControl = new UntypedFormControl('');
  paisControl = new UntypedFormControl('');

  // Carrusel de novelas actualizadas recientemente
  readonly latestUpdatedNovels = signal<Publication[]>([]);
  readonly loadingCarousel = signal<boolean>(true);

  paises = [
    'Cuba',
    'EEUU',
    'UK',
    'España',
    'Turquía',
    'Corea',
    'China',
    'Japón',
    'Inglaterra',
    'Alemania',
    'México',
    'Colombia',
    'Argentina',
    'Francia',
    'Brasil',
    'Italia',
    'Rusia',
    'Canadá',
    'Austria',
    'Australia',
    'Taiwán',
    'Hong Kong',
    'Noruega',
    'Finlandia',
    'Ucrania',
    'Irlanda',
  ];

  filtersShows = {
    page: 1,
    page_size: 20,
    next: 1,
    ordering: '-fecha_creacion',
    nombre__contains: '',
    genero_raw: 'Novela',
    genero_raw_exclude: 'Dorama',
    pais: '',
    ano__in: '',
  };

  // Lista de años para el filtro
  anos = Array.from({ length: new Date().getFullYear() - 1969 }, (_, i) =>
    String(new Date().getFullYear() - i),
  );
  anoControl = new UntypedFormControl('');

  shows: Serie[] = [];

  viewModeControl = new UntypedFormControl('card');

  loading = true;
  isLoadingMore = false;
  loadMore = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.title.setTitle(`Novelas - Picta`);

    // Cargar carrusel de novelas actualizadas
    this.loadLatestUpdatedNovels();

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
        this.filtersShows.pais = pais;
      } else {
        delete this.filtersShows.pais;
      }
      if (nombre) {
        this.filtersShows.nombre__contains = '*' + nombre + '*';
      } else {
        delete this.filtersShows.nombre__contains;
      }
      if (ano) {
        this.filtersShows.ano__in = ano;
      } else {
        delete this.filtersShows.ano__in;
      }
      this.filtersShows.page = 1;
      this.filtersShows.next = 1;

      // Recargar datos con los filtros de URL
      this.loadData();
    });

    // Inicializar el formulario de búsqueda después de cargar datos
    this.initSearchForm();
  }

  private loadData(): void {
    this.loading = true;
    this.serieService.getAll(this.filtersShows).subscribe((response: any) => {
      this.shows = response.results;
      this.filtersShows.page = response.next;
      this.filtersShows.next = response.next;
      this.loading = false;
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loading || this.isLoadingMore || !this.filtersShows.next) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition >= scrollThreshold) {
      this.filters();
    }
  }

  setOrder(order: string) {
    this.filtersShows.ordering = order;
    this.filtersShows.page = 1;
    this.filtersShows.next = 1;
    this.filters(true);
  }

  filters(replace = false) {
    if (this.filtersShows.next && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.loadMore = true;
      this.serieService.getAll(this.filtersShows).subscribe({
        next: (response: PictaResponse<Serie>) => {
          this.shows = replace
            ? response.results
            : [...this.shows, ...response.results];
          this.filtersShows.page = response.next;
          this.filtersShows.next = response.next;
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
            this.filtersShows.pais = pais;
          } else {
            delete this.filtersShows.pais;
          }
          this.filtersShows.page = 1;
          this.filtersShows.next = 1;

          // Update URL
          this.updateUrl(pais, this.searchControl.value, this.anoControl.value);
        }),
        switchMap(() => this.loadSeries.getAll(this.filtersShows)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.shows = response?.results || [];
        this.filtersShows.page = response?.next || 1;
        this.filtersShows.next = response?.next || 1;
        this.loading = false;
      });

    // Observador para año
    this.anoControl.valueChanges
      .pipe(
        tap(ano => {
          this.loading = true;
          if (ano) {
            this.filtersShows.ano__in = ano;
          } else {
            delete this.filtersShows.ano__in;
          }
          this.filtersShows.page = 1;
          this.filtersShows.next = 1;

          // Update URL
          this.updateUrl(this.paisControl.value, this.searchControl.value, ano);
        }),
        switchMap(() => this.loadSeries.getAll(this.filtersShows)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.shows = response?.results || [];
        this.filtersShows.page = response?.next || 1;
        this.filtersShows.next = response?.next || 1;
        this.loading = false;
      });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        map(query => (query ? '*' + query + '*' : '')),
        tap(query => {
          if (query) {
            this.filtersShows.nombre__contains = query;
          } else {
            delete this.filtersShows.nombre__contains;
          }
          this.filtersShows.page = 1;
          this.filtersShows.next = 1;

          // Update URL
          this.updateUrl(
            this.paisControl.value,
            this.searchControl.value,
            this.anoControl.value,
          );
        }),
        distinctUntilChanged(),
        switchMap(query => this.loadSeries.getAll(this.filtersShows)),
      )
      .subscribe((response: PictaResponse<Serie>) => {
        this.shows = response?.results || [];
        this.filtersShows.page = response?.next || 1;
        this.filtersShows.next = response?.next || 1;
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
    delete this.filtersShows.nombre__contains;
    this.filtersShows.page = 1;
    this.filtersShows.next = 1;
    this.updateUrl(this.paisControl.value, '', this.anoControl.value);
    this.filters();
  }

  private loadLatestUpdatedNovels(): void {
    this.publicationService.getByNovelaLastUpdate().subscribe({
      next: (response: Publication[]) => {
        this.latestUpdatedNovels.set(response || []);
        this.loadingCarousel.set(false);
      },
      error: () => {
        this.latestUpdatedNovels.set([]);
        this.loadingCarousel.set(false);
      },
    });
  }

  showAllUpdatedNovels() {
    this.router.navigate(['/novelas/recientes']);
  }
}
