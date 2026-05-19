import { Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, input, inject } from '@angular/core';
import {SearchService} from '../../services/search.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {SubSink} from 'subsink';
import {PictaResponse} from '../../../../models/response.picta.model';
import { PositionServiceService } from '../../../categoria/services/position-service.service';
import { UntypedFormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { isPlatformBrowser, NgComponentOutlet } from '@angular/common';
import { SearchListComponent } from '../search-list/search-list.component';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CategoriaLoadingStateComponent } from '../../../categoria/components/categoria-loading-state/categoria-loading-state.component';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
  imports: [SearchListComponent, NgComponentOutlet, MatProgressSpinner, MatIconModule, MatButtonToggleModule, ReactiveFormsModule]
})
export class SearchComponent implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private positionServiceService = inject(PositionServiceService);
  private localStorage = inject(LocalstorageService);
  private platformId = inject(PLATFORM_ID);

  readonly mode = input('list');
  isLoading: boolean = true;
  
  results: any;
  query: string;
  loading = true;
  numbers = [1, 2, 3, 4, 5];
  page: any = 1;
  next: any;
  count: number;
  subs = new SubSink();
  viewModeControl = new UntypedFormControl('list');
  loadingMore = false;
  readonly loadingStateComponent = CategoriaLoadingStateComponent;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.query = params.get('query');
      this.loadingMore = false;
      this.subs.add(
        this.searchService.search(this.query, '1').pipe(
          finalize(() => {
            this.isLoading = false;
          })
        ).subscribe((res: PictaResponse<any[]>) => {
          this.results = res.results ?? [];
          this.count = res.count;
          this.page = res.next;
          this.next = res.next;
        })
      );
    });
    if (isPlatformBrowser(this.platformId)) {
      this.listenViewModeControl();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isLoading || this.loadingMore || !this.next || !this.results?.length) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition >= scrollThreshold) {
      this.loadData();
    }
  }

  loadData() {
    if (this.next && !this.loadingMore) {
      this.loadingMore = true;
      this.subs.add(
        this.searchService.search(this.query, this.page).pipe(
          finalize(() => {
            this.loadingMore = false;
          })
        ).subscribe({
          next: (res: PictaResponse<any[]>) => {
            res.results?.forEach(item => this.results.push(item));
            this.page = res.next;
            this.next = res.next;
          },
          error: () => {
            this.next = null;
          }
        })
      );
    }
  }

  setCoords(video: any) {
    const card = document.querySelector(`#card${video.id}`);
    this.positionServiceService.position.next(
      {
        x: card.getBoundingClientRect().left,
        y: card.getBoundingClientRect().top,
      }
    );
  }

  private listenViewModeControl() {
    const savedValue = JSON.parse(this.localStorage.getItem('viewMode'));
    if (savedValue) {
      this.viewModeControl.setValue(savedValue);
    }
    this.viewModeControl.valueChanges.subscribe(value => {
      this.localStorage.setItem('viewMode', JSON.stringify(value));
    });
  }
}
