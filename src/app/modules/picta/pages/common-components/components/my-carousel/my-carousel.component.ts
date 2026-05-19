import { Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, input, output, viewChild, inject, signal } from '@angular/core';
import {fromEvent} from 'rxjs';
import {map} from 'rxjs';
import {SubSink} from 'subsink';
import {SubscriptionService} from '../../../../../../services/subscription.service';
import {AuthService} from '../../../../../../services/auth.service';
import {Router} from '@angular/router';
import {UserModel} from '../../../../models/user.model';
import {animate, style, transition, trigger} from '@angular/animations';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import {cardsAnimation} from '../../../../animations/cards';
import {Publication} from '../../../medias/models/publicacion.model';
import { MyVideoDetailsComponent } from '../my-video-details/my-video-details.component';
import { MatNavList } from '@angular/material/list';
import { MyVideoCardComponent } from '../my-video-card/my-video-card.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { NgClass, NgStyle, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-my-carousel',
    templateUrl: './my-carousel.component.html',
    styleUrls: ['./my-carousel.component.scss'],
    animations: [
        cardsAnimation,
        trigger('detailsAnimation', [
            transition(':enter', [
                style({ opacity: 0, height: '0' }),
                animate('500ms', style({ opacity: 1, height: '100%' })),
            ]),
            transition(':leave', [
                style({ opacity: 1, height: '100%' }),
                animate('500ms', style({ opacity: 0, height: '0' })),
            ])
        ])
    ],
    imports: [NgClass, MatIconButton, MatIcon, MatButton, NgStyle, MatTooltip, MyVideoCardComponent, MatNavList, MyVideoDetailsComponent, AsyncPipe]
})
export class MyCarouselComponent implements OnInit, OnDestroy, OnChanges {
  private subscribeService = inject(SubscriptionService);
  authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  isHandset$ = this.breakpointObserver.observe('(max-width: 599px)').pipe(
    map(result => result.matches)
  );

  readonly videos = input<Publication[]>(undefined);
  readonly horizontal = input(true);
  horizontalState = signal(true);
  readonly title = input<string>(undefined);
  readonly subtitle = input<string>(undefined);
  readonly controls = input(true);
  readonly arrows = input(true);
  readonly mode = input('card');
  readonly shwDtail = input<boolean>(undefined, { alias: "showDetails" });
  readonly carousel = viewChild<ElementRef>('carousel');


  isDown = false;
  startX;
  scrollLeft;
  showDetailsPanel: boolean;
  activeVideo: Publication;
  readonly load = output();
  showLeftArrow: boolean;
  showRigthArrow = true;
  readonly hasNext = input<boolean>(undefined);
  subs = new SubSink();
  subscribing: boolean;
  subscribed: boolean;
  subscription = input<any>(undefined);
  user: UserModel;
  readonly canal = input<any>(undefined);
  readonly temporada = input<any>(undefined);
  readonly showSideOverlays = input(true);
  readonly noPadding = input(false);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.checkSubscription();
    this.subs.add(
      this.getScroll(this.carousel().nativeElement).subscribe(scroll => {
        if (scroll > 0) {
          this.showLeftArrow = true;
        } else {
          this.showLeftArrow = false;
        }
        if (scroll < this.carousel().nativeElement.scrollWidth - this.carousel().nativeElement.clientWidth - 200) {
          this.showRigthArrow = true;
        } else {
          this.load.emit();
          this.showRigthArrow = false;
        }
      })
    );

  }

  getScroll(carousel) {
    return fromEvent(carousel, 'scroll').pipe(
      map(
        (event: UIEvent): number => {
          return (carousel.scrollLeft);

        }
      )
    );
  }

  mouseDown(carousel: HTMLDivElement, $event) {
    this.isDown = true;
    carousel.classList.add('active');

    this.startX = $event.pageX - carousel.offsetLeft;
    this.scrollLeft = carousel.scrollLeft;
  }

  mouseLeave(carousel: HTMLDivElement) {
    this.isDown = false;
    carousel.classList.remove('active');
  }

  mouseUp(carousel: HTMLDivElement) {

    this.isDown = false;
    carousel.classList.remove('active');

  }

  mouseMove(carousel: HTMLDivElement, $event) {
    if (!this.isDown) {
      return;
    }
    let x;

    $event.preventDefault();
    x = $event.pageX - carousel.offsetLeft;
    const scroll = x - this.startX;
    carousel.scrollLeft = this.scrollLeft - scroll;
    this.checkScroll(carousel);
  }

  scrollCarousel(carousel: HTMLDivElement, direction: string) {
    if (direction === 'left') {
      carousel.scrollLeft += -carousel.offsetWidth;
    } else {
      this.load.emit();
      carousel.scrollLeft += carousel.offsetWidth;
    }
  }

  showDetails(video: Publication) {
    this.showDetailsPanel = true;
    this.activeVideo = video;
  }

  closePanel() {
    this.showDetailsPanel = false;
    this.activeVideo = null;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  showDetailsOnHover(video: Publication) {
    if (this.showDetailsPanel) {
      this.activeVideo = video;
    }
  }

  handleSubscribe() {
    if (this.subscribing) return;
    this.subscribing = true;
    if (!this.subscribed) {
      this.subs.add(
        this.subscribeService.subscribe(this.canal().id).subscribe({
          next: (res) => {
            this.subscribed = true;
            this.subscribing = false;
            this.subscription().set(res);
            this.snackBar.open(`Te has suscrito al canal ${this.canal().nombre}`);
          },
          error: (err) => {
            this.subscribing = false;
            console.error('Error subscribing:', err);
            this.snackBar.open('Error al intentar suscribirte. Intenta novamente.');
          }
        })
      );
    } else {
      this.dialog.open(ConfirmDialogComponent, {data: {msg: `¿Estás seguro que deseas cancelar tu suscripción al canal ${this.canal().nombre}?`}}).afterClosed().subscribe(result => {
        if (result) {
          this.subs.add(
            this.subscribeService.unsubscribe(this.subscription().id).subscribe(res => {
              this.subscribed = false;
              this.subscribing = false;
              this.snackBar.open(`Has cancelado tu suscripción al canal ${this.canal().nombre}`);
            })
          );
        }
      });
    }
  }

  navigate() {
    const canal = this.canal();
    if (canal) {
      this.router.navigate(['/canal', canal.alias]);
    }
    const temporada = this.temporada();
    if (temporada) {
      this.router.navigate(['/serie', temporada.serieId]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkSubscription();
  }

  checkScroll(carousel: HTMLDivElement) {
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    const THRESHOLD = 300;
    if (carousel.scrollLeft >= maxScrollLeft - THRESHOLD) {
      this.load.emit();
    }
  }

  private checkSubscription() {
    this.subscribed = !!this.subscription();
  }
}
