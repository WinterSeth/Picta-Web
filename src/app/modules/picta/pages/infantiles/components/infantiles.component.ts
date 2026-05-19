import { Component, HostListener, inject } from '@angular/core';
import { PictaResponse } from '../../../models/response.picta.model';
import { debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { Serie } from '../../medias/models/publicacion.model';
import { SerieService } from '../../categoria/services/serie.service';
import { Title } from '@angular/platform-browser';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UpperCasePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { SerieListComponent } from '../../categoria/components/serie-list/serie-list.component';
import { SectionHeaderComponent } from '../../common-components/components/section-header/section-header.component';

@Component({
    selector: 'app-infantiles',
  imports: [MatProgressSpinner, MatFormField, MatLabel, MatInput, ReactiveFormsModule, MatButton, MatTooltip, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, MatButtonToggleGroup, MatButtonToggle, SerieListComponent, UpperCasePipe, SectionHeaderComponent],
    templateUrl: './infantiles.component.html',
    styleUrl: './infantiles.component.scss'
})
export class InfantilesComponent {
private serieService = inject(SerieService);
private title = inject(Title);

next: string;

  filtersShows = {
    page: 1,
    page_size: 20,
    next: 1,
    ordering: '-last_update',
    nombre__contains: '',
    genero_raw: 'Infantil'
  };

  shows: Serie[] = [];

  viewModeControl = new UntypedFormControl('card');
  searchControl = new UntypedFormControl('');

  loading = true;
  isLoadingMore = false;

/** Inserted by Angular inject() migration for backwards compatibility */
constructor(...args: unknown[]);

  constructor() {}
  
  ngOnInit(): void {
    this.title.setTitle(`Infantiles - Picta`);
    this.serieService.getAll(this.filtersShows).subscribe((response: any) => {
      this.shows = response.results;
      //this.filtersAnimes = response.results;
      this.filtersShows.page = response.next;
      this.filtersShows.next = response.next;
      this.loading = false;
      this.initSearchForm();
    })
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
      this.serieService.getAll(this.filtersShows).subscribe({
        next: (response: PictaResponse<Serie>) => {
          this.shows = replace ? response.results : [...this.shows, ...response.results];
          this.filtersShows.page = response.next;
          this.filtersShows.next = response.next;
        },
        error: () => {
          this.isLoadingMore = false;
        },
        complete: () => {
          this.isLoadingMore = false;
        }
      });
    }
  }

  private initSearchForm() {
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
          }),
          distinctUntilChanged(),
          switchMap(query => query ? this.serieService.getAll(this.filtersShows) : of(null))
        )
        .subscribe((response: PictaResponse<Serie>) => {
          if (response) {
            this.shows = response.results;
            this.filtersShows.page = response.next;
            this.filtersShows.next = response.next;
          } else {
            this.shows = this.shows;
            this.filtersShows.page = 1;
            this.filtersShows.next = 1;
          }
        });
    } 
}
