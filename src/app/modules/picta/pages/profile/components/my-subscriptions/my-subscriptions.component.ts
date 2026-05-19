import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import {AuthService} from '../../../../../../services/auth.service';
import {UserModel} from '../../../../models/user.model';
import {SubscriptionService} from '../../../../../../services/subscription.service';
import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import {ConfirmDialogComponent} from '../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Title} from '@angular/platform-browser';
import {PictaResponse} from "../../../../models/response.picta.model";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { MatNavList, MatListItem, MatListItemAvatar, MatListItemTitle, MatListItemLine, MatListItemMeta, MatListItemIcon, MatListModule } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-my-subscriptions',
    templateUrl: './my-subscriptions.component.html',
    styleUrls: ['./my-subscriptions.component.scss'],
    imports: [MatDivider, NgOptimizedImage, MatListModule, MatNavList, MatListItem, MatListItemAvatar, MatListItemTitle, RouterLinkActive, RouterLink, MatListItemLine, MatListItemMeta, MatIcon, MatListItemIcon, MatProgressSpinner]
})
export class MySubscriptionsComponent implements OnInit {
  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  user: UserModel;
  subscriptions: any[] = [];

  filters ={
    page: 1,
    page_size: 50
  };
  loading = true;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.titleService.setTitle('Mis suscripciones - Perfil');
    this.loadUser();
  }

  loadSubscriptions() {
    if (!this.filters.page) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.subscriptionService.getAllSubscriptionsByUser(this.filters).pipe(
      finalize(() => this.loading = false)
    ).subscribe((response: PictaResponse<any>) => {
      this.subscriptions = this.filters.page > 1 ? [...this.subscriptions, ...response.results] : response.results;
      this.filters.page = response.next;
    });
  }

  handleSubscribe(evt, {id, canal}) {
    evt.stopPropagation();
    evt.preventDefault();
    this.dialog.open(ConfirmDialogComponent, {data: {msg: `¿Estás seguro que deseas cancelar tu suscripción al canal ${canal.nombre}?`}}).afterClosed().subscribe(result => {
      if (result) {
        this.subscriptionService.unsubscribe(id).subscribe(res => {
          this.snackbar.open(`Has cancelado tu suscripción al canal ${canal.nombre}`);
          this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
        });

      }
    });
  }

  private loadUser() {
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.user = user;
        this.loadSubscriptions();
      } else {
        this.router.navigate(['']);
      }
    });
  }
}
