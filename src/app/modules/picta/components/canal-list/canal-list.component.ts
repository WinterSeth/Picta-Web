import { Component, HostListener, OnInit, inject } from '@angular/core';
import {CanalService} from '../../pages/canal/services/canal-service.service';
import {AuthService} from '../../../../services/auth.service';
import {UserModel} from '../../models/user.model';
import {SubscriptionService} from '../../../../services/subscription.service';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Canal} from '../../pages/canal/models/canal.model';
import {PictaResponse} from '../../models/response.picta.model';
import {Title} from "@angular/platform-browser";
import { MatIcon } from '@angular/material/icon';
import { CanalListItemComponent } from '../canal-list-item/canal-list-item.component';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalstorageService } from '../../../../services/localstorage.service';
import { CategoriaLoadingStateComponent } from '../../pages/categoria/components/categoria-loading-state/categoria-loading-state.component';
import { SectionHeaderComponent } from '../../pages/common-components/components/section-header/section-header.component';

@Component({
    selector: 'app-canal-list',
    templateUrl: './canal-list.component.html',
    styleUrls: ['./canal-list.component.scss'],
  imports: [MatProgressSpinner, MatFormField, MatLabel, MatInput, ReactiveFormsModule, CanalListItemComponent, MatIcon, MatButtonToggleModule, CategoriaLoadingStateComponent, SectionHeaderComponent]
})
export class CanalListComponent implements OnInit {
  private canalService = inject(CanalService);
  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private activatedRoute = inject(ActivatedRoute);
  private title = inject(Title);
  private localStorage = inject(LocalstorageService);

  canales: Canal[];
  loading: boolean = true;

  filters = {
    page: 1,
    page_size: 20,
    ordering: '-cantidad_suscripciones',
    nombre__contains: '',
    next: 1
  };

  user: UserModel;
  searchControl = new UntypedFormControl('');
  viewModeControl = new UntypedFormControl('list');
  loadingMore = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const activatedRoute = this.activatedRoute;

    this.title.setTitle('Canales - Picta')

    this.canales = activatedRoute.snapshot.data['canales'].results;
    this.filters.page = activatedRoute.snapshot.data['canales'].next;

    this.authService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
      if (user) {
        this.user = user;
        this.loadCanales();
      } else {
        delete this.user;
      }
    });
  }

  ngOnInit() {
    // this.loadCanales();
    this.listenSearchControl();
    this.listenViewModeControl();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loading || this.loadingMore || !this.filters.page || !this.canales?.length) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition >= scrollThreshold) {
      this.loadCanales();
    }
  }

  loadCanales() {
    if (this.filters.page && !this.loadingMore) {
      this.loadingMore = true;
      this.canalService.getChanels(this.filters).subscribe({
        next: (resp: any) => {
          this.canales.push(...resp.results);
          this.filters.page = resp.next;
          this.loading = false;
        },
        error: () => {
          this.loadingMore = false;
        },
        complete: () => {
          this.loadingMore = false;
        }
      });
    }
  }

  private listenSearchControl() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(600),
        map(query => '*' + query + '*'),
        tap(query => {
          this.filters.nombre__contains = query;
          this.filters.page = 1;
          // this.filters.next = 1;
        }),
        distinctUntilChanged(),
        switchMap(query => this.canalService.getChanels(
          this.filters
        ))
      )
      .subscribe((response: PictaResponse<Canal>) => {
        this.canales = response.results;
        this.filters.page = response.next;
        this.filters.next = response.next;
      });
  }

  private listenViewModeControl() {
    const savedValue = JSON.parse(this.localStorage.getItem('canalViewMode'));
    if (savedValue) {
      this.viewModeControl.setValue(savedValue);
    }

    this.viewModeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.localStorage.setItem('canalViewMode', JSON.stringify(value));
      });
  }
}
