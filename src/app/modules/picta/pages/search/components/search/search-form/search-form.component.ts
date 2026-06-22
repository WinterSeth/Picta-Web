import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, switchMap, tap, catchError} from 'rxjs';
import { of, Subscription } from 'rxjs';
import {SearchService} from '../../../services/search.service';
import {Router} from '@angular/router';
// removed MatAutocomplete imports (using custom list panel)
import {Observable} from "rxjs/internal/Observable";

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss'],
    imports: [ReactiveFormsModule, FormsModule, MatIconModule, MatListModule, MatProgressSpinnerModule]
})
export class SearchFormComponent implements OnInit {
  private _documentClickListener: any;
  @ViewChild('searchForm', { read: ElementRef }) private searchFormRef: ElementRef;
  private searchService = inject(SearchService);
  private router = inject(Router);

  searchFormControl: UntypedFormControl = new UntypedFormControl('');
  options: any[];
  options$: Observable<any[]>;
  optionsList: any[] = [];
  private _optionsSub: Subscription;
  isSearching = false;
  @ViewChild('searchInput', { read: ElementRef }) private searchInputRef: ElementRef;
  value: string;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  ngOnInit() {
    this.options$ = this.searchFormControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.isSearching = true),
      switchMap((value: string) => value ? this.searchService.search(value) : of({results: []})),
      map((response: any) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.results && Array.isArray(response.results)) return response.results;
        // some APIs return object with nested results.results
        if (response.results && response.results.results && Array.isArray(response.results.results)) return response.results.results;
        return [];
      }),
      catchError(() => of([]))
    );

    // subscribe and populate optionsList so template can read a simple array
    this._optionsSub = this.options$.subscribe(arr => {
      console.log('search form - options array length:', (arr || []).length, arr && arr.slice && arr.slice(0,2));
      this.optionsList = arr || [];
      this.isSearching = false;
    });

    // close suggestions when clicking outside (bubble phase)
    this._documentClickListener = (evt: MouseEvent) => {
      try {
        const hostEl = this.searchFormRef?.nativeElement;
        if (!hostEl) return;
        if (!hostEl.contains(evt.target)) {
          this.closePanel();
        }
      } catch (e) {
        // ignore
      }
    };
    document.addEventListener('click', this._documentClickListener, false);
  }

  ngOnDestroy() {
    if (this._optionsSub) this._optionsSub.unsubscribe();
    if (this._documentClickListener) document.removeEventListener('click', this._documentClickListener, false);
  }

  search() {
    const {value} = this.searchFormControl;
    if (value) {
      this.isSearching = false;
      this.router.navigate(['/search', value]);
    }


  }

  displayFn(item): string | undefined {
    return item ? item.nombre : undefined;

  }

  onBlur() {
    // Do not clear the input on blur — keep suggestions visible until user selects
    // or navigates. Clearing here caused results to disappear immediately.
    return;
  }

  closePanel() {
    this.isSearching = false;
    this.optionsList = [];
  }

  buscar(evt: any) {
    const option = evt.option.value;
    if (option.tipo) {
      switch (option.tipo) {
        case 'canal': {

          this.router.navigate(['canal', option.alias]);
          break;
        }
        case 'publicacion': {
          this.router.navigate(['medias', option.slug_url]);
          break;
        }
        case 'live': {
          this.router.navigate(['medias', option.slug_url]);
          break;
        }
        case 'lista_reproduccion_canal': {
          this.router.navigate(['medias', option.publicaciones[0].slug_url]);
          break;
        }
      }

    } else {
      this.router.navigate(['search', option]);

    }
    this.searchFormControl.reset();
    this.options = [];
  }

  onOptionClick(option: any) {
    if (!option) return;
    if (option.tipo) {
      switch (option.tipo) {
        case 'canal':
          this.router.navigate(['canal', option.alias]);
          break;
        case 'publicacion':
          this.router.navigate(['medias', option.slug_url]);
          break;
        case 'live':
          this.router.navigate(['medias', option.slug_url]);
          break;
        case 'lista_reproduccion_canal':
          this.router.navigate(['medias', option.publicaciones?.[0]?.slug_url]);
          break;
        default:
          this.router.navigate(['search', option]);
      }
    } else {
      this.router.navigate(['search', option]);
    }
    this.searchFormControl.reset();
  }
}
