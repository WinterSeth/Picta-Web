import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  input,
  output,
  EventEmitter,
  Output,
  viewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { menuSlideIn } from '../../animations/menus';
import { UserModel } from '../../models/user.model';
import { Observable, Subject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SubSink } from 'subsink';
import { MatToolbar } from '@angular/material/toolbar';
import { Platform } from '@angular/cdk/platform';
import { UnseenPipe } from '../../pipes/unseen.pipe';
import { AuthService } from '../../../../services/auth.service';
import { PanelCloseService } from '../../../../services/panel-close.service';
import { ActivePerfilService } from '../../../../services/active-perfil.service';
import { NotificacionPublicacionService } from '../../services/notificacion-publicacion.service';
import { NotificationStoreService } from '../../services/notification-store.service';
import { NotificationService } from '../../../../services/notification.service';
import { PublicationService } from '../../pages/medias/services/publication-service';
import { CredentialsService } from '../../services/credentials.service';
import { BrowserNotificationService } from '../../../../services/browser-notification.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ScrollDispatcher } from '@angular/cdk/overlay';
import { Publication } from '../../pages/medias/models/publicacion.model';
import { PictaResponse } from '../../models/response.picta.model';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { SeleccionarPerfilComponent } from '../../pages/profile/components/seleccionar-perfil/seleccionar-perfil.component';
import { NotificacionItemComponent } from '../common/notificacion-item/notificacion-item.component';
import { SearchFormComponent } from '../../pages/search/components/search/search-form/search-form.component';
import { UpperCasePipe, NgOptimizedImage } from '@angular/common';
import {
  MatMenuItem,
  MatMenuModule,
  MatMenuTrigger,
} from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { UserService } from '../../../../services/user.service';
import { MatDividerModule } from '@angular/material/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-material-header',
  templateUrl: './material-header.component.html',
  styleUrls: ['./material-header.component.scss'],
  providers: [UnseenPipe],
  animations: [
    trigger('offlineMode', [
      transition(':enter', [
        style({ maxWidth: 0, opacity: 0 }),
        animate('1s', style({ maxWidth: '300px', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ maxWidth: '300px', opacity: 1 }),
        animate('1s', style({ maxWidth: '0', opacity: 0 })),
      ]),
    ]),
    menuSlideIn,
    trigger('menuAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-8px)' }),
        animate(
          '180ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '120ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 0, transform: 'scale(0.95)' }),
        ),
      ]),
    ]),
  ],
  imports: [
    MatToolbar,
    MatIconButton,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    MatMenuModule,
    MatMenuItem,
    MatMenuTrigger,
    SearchFormComponent,
    NotificacionItemComponent,
    MatProgressSpinner,
    MatButton,
    UpperCasePipe,
    MatDividerModule,
    NgOptimizedImage,
  ],
})
export class MaterialHeaderComponent implements OnInit, OnDestroy {
  loginService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private breakpointObserver = inject(BreakpointObserver);
  private panelClose = inject(PanelCloseService);
  private notificacionPublicacionService = inject(
    NotificacionPublicacionService,
  );
  notificationStore = inject(NotificationStoreService);
  private renderer = inject(Renderer2);
  private platform = inject(Platform);
  private notificationService = inject(NotificationService);
  private unseenPipe = inject(UnseenPipe);
  private publicationService = inject(PublicationService);
  scrollDispatcher = inject(ScrollDispatcher);
  private credentialsService = inject(CredentialsService);
  private browserNotificationService = inject(BrowserNotificationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private activePerfilService = inject(ActivePerfilService);

  userService = inject(UserService);
  authService = inject(AuthService);

  readonly toggleSide = output();
  @Output() menuClosed: EventEmitter<void>;
  @Output() menuOpened: EventEmitter<void>;
  readonly newItemEvent = output<any>();

  readonly isActive = input(undefined);
  readonly isMobile = input(false);
  usuario$ = this.userService.getUserInfo();
  user: UserModel;
  isAdmin: boolean;
  subs = new SubSink();
  readonly toolbar = viewChild(MatToolbar);
  socials = [
    {
      imgIcon: 'img/Facebook.svg',
      link: 'https://www.facebook.com/share/18barwpBz7/',
      label: '/pictaCuba',
    },
    {
      imgIcon: 'img/Twitter.svg',
      link: 'https://twitter.com/pictacuba',
      label: '/pictaCuba',
    },
    {
      imgIcon: 'img/telegram-icon.svg',
      link: 'https://t.me/picta_comunidad',
      label: '/picta_comunidad',
    },
    {
      imgIcon: 'img/instagram-icon.svg',
      link: 'https://instagram.com/picta.social',
      label: '/picta.social',
    },
  ];
  notificationsParams = { page: 1, page_size: 10 };
  livesParams = {
    page: 1,
    page_size: 10,
    tipo: 'live', // live__finalizado: false
  };
  dropdownLogin = false;
  isJefeCanalWebmaster: boolean;
  masMenuOpened = false;
  notificacionesList: any[] = [];
  wasLoggedIn = false;
  unseenNotifications = 0;
  loadingNotifications = false;
  canalesTv: Observable<Publication[]>;
  lives: Publication[] = [];
  destroyed = new Subject();
  searchOpen = false;

  status: boolean = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

constructor() {
    this.canalesTv = this.publicationService.getByTipoContenido('');

    // Inicializar badge desde localStorage
    const storedBadge = localStorage.getItem('notification_badge_count');
    this.unseenNotifications = storedBadge ? parseInt(storedBadge, 10) : 0;

// Subscribe al badge count para actualizar en tiempo real
    this.subs.add(
      this.notificationStore.badgeCount$.subscribe(count => {
        this.unseenNotifications = count;
        this.cdr.detectChanges();
      })
    );

this.loginService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
      if (user) {
        this.user = user;
        this.setPermissions();
        // Solo cargar notificaciones una vez por sesión usando sessionStorage
        const sessionKey = 'notifications_loaded';
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, 'true');
          this.notificacionPublicacionService
            .getAll({ page: 1, page_size: 10 })
            .subscribe((response: PictaResponse<any>) => {
              const results = response.results ?? [];
              this.notificacionesList = results;
              const noVistas = results.filter((n: any) => !n.vista);
              const countNoVistas = noVistas.length;
              localStorage.setItem('notification_badge_count', String(countNoVistas));
              this.unseenNotifications = countNoVistas;
            });
        }
      } else {
        delete this.user;
        this.notificacionesList = [];
        sessionStorage.removeItem('notifications_loaded');
        localStorage.setItem('notification_badge_count', '0');
        this.unseenNotifications = 0;
      }
    });

this.loginService.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe(data => {
        // Only reload if there's actual notification data
        if (data && typeof data === 'object') {
this.notificationStore.load(true);
           
           setTimeout(() => {
             const count = this.notificationStore.badgeCount();
             this.unseenNotifications = count;
             this.cdr.detectChanges();
           }, 300);
          
          // Show browser notification
          this.browserNotificationService.showNotification(data);
        }
      });
  }

  moreOpened() {
    this.status = !this.status;
  }

  moreClosed() {
    this.status = !this.status;
  }

  ngOnInit() {
    this.panelClose.closeAll.subscribe(close => {
      this.dropdownLogin = false;
    });
  }

  toggleMenu() {
    // TODO: The 'emit' function requires a mandatory any argument
    this.newItemEvent.emit(this.status);
  }

  isLoginIn(): boolean {
    return this.authService.isLoggedIn();
  }

loadNotifications() {
    this.loadingNotifications = true;
    this.notificacionesList = [];
    this.notificationsParams = { page: 1, page_size: 10 };

    this.notificacionPublicacionService
      .getAll(this.notificationsParams)
      .subscribe((response: PictaResponse<any>) => {
        const results = response.results ?? [];
        this.notificacionesList = results;
        this.notificationsParams.page = response.next;
        this.loadingNotifications = false;

        // Contar y marcar no vistas
        const noVistas = results.filter((n: any) => !n.vista);
        const countNoVistas = noVistas.length;

        // Guardar badge
        localStorage.setItem('notification_badge_count', String(countNoVistas));
        this.unseenNotifications = countNoVistas;

        if (noVistas.length > 0) {
          const idsNoVistas = noVistas.map((n: any) => n.id).join(',');
          const firstId = noVistas[0].id;
          this.notificacionPublicacionService
            .markAsRead(firstId, idsNoVistas)
            .subscribe({
              next: () => {},
              error: () => {}
            });
        }
      });
  }

  async markNotificationAsReaded() {}
  
  toggleSidenav() {
    this.toggleSide.emit();
  }

  logout() {
    this.loginService.logout();
    this.notificationService.open('ok', 'Sesión cerrada');
    this.router.navigate(['/inicio']);
  }

  openProfileSelector(): void {
    // If there's an active profile, show modal to switch profiles
    if (this.activePerfilService.hasActiveProfile()) {
      this.dialog.open(SeleccionarPerfilComponent, {
        disableClose: true,
        width: '720px',
        minWidth: '340px',
        maxWidth: '95vw',
        panelClass: 'picta-dark-dialog',
        backdropClass: 'picta-dialog-backdrop',
        data: { isDialog: true }
      });
    } else {
      // No profile selected yet, go to profile page
      this.router.navigate(['/perfil']);
    }
  }

  showLogin() {
    this.dropdownLogin = !this.dropdownLogin;
  }

  onMasMenuOpened() {
    this.masMenuOpened = true;
  }

onMasMenuClosed() {
    this.masMenuOpened = false;
  }

getMoreNotifications() {
    if (this.notificationsParams.page) {
      this.loadingNotifications = true;
      this.notificacionPublicacionService
        .getAll(this.notificationsParams)
        .subscribe((response: PictaResponse<any>) => {
          const nuevasNotificaciones = response.results ?? [];
          this.notificacionesList = this.notificacionesList.concat(
            nuevasNotificaciones,
          );
          this.notificationsParams.page = response.next;
          this.loadingNotifications = false;

          // Marcar las nuevas notificaciones no vistas
          const noVistas = nuevasNotificaciones.filter((n: any) => !n.vista);
          if (noVistas.length > 0) {
            const idsNoVistas = noVistas.map((n: any) => n.id).join(',');
            const firstId = noVistas[0].id;
            this.notificacionPublicacionService
              .markAsRead(firstId, idsNoVistas)
              .subscribe();
          }
        });
    }
  }

  onNotificationsPanelScroll(event: Event) {
    const target = event.target as HTMLElement;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 48;

    if (
      isNearBottom &&
      !this.loadingNotifications &&
      this.notificationsParams.page
    ) {
      this.getMoreNotifications();
    }
  }

  token() {
    this.loginService.changeToken();
  }

  getSubscriptionPlanName(): string {
    const plan = this.user?.subscription_plan;

    if (!plan) {
      return 'Sin plan';
    }

    // Buscar nombre directo
    const name = plan.nombre || plan.name;
    if (name) {
      return name;
    }

    // Buscar en plan anidado
    const nestedPlan = plan.plan;
    if (nestedPlan) {
      return nestedPlan.nombre || nestedPlan.name || 'Plan activo';
    }

    return 'Plan activo';
  }

  hasActiveSubscriptionPlan(): boolean {
    const plan = this.user?.subscription_plan;

    if (!plan) {
      return false;
    }

    const status = (plan.estado || plan.status || '').toString().toLowerCase();
    if (
      [
        'cancelada',
        'canceled',
        'cancelled',
        'expirada',
        'expired',
        'vencida',
      ].includes(status)
    ) {
      return false;
    }

    if (plan.activo === false || plan.is_active === false) {
      return false;
    }

    return true;
  }

  getSubscriptionDaysRemaining(): number | null {
    const user = this.user;
    const plan = user?.subscription_plan;

    if (!user && !plan) {
      return null;
    }

    // Buscar dias_restantes directamente en el usuario
    let explicitDays = Number(
      user?.dias_restantes ?? user?.days_remaining ?? user?.remaining_days,
    );

    // Si no está en usuario, buscar en subscription_plan directamente
    if (Number.isNaN(explicitDays) || explicitDays < 0) {
      explicitDays = Number(
        plan?.dias_restantes ?? plan?.days_remaining ?? plan?.remaining_days,
      );
    }

    // Si no está en subscription_plan, buscar en subscription_plan.plan
    if (Number.isNaN(explicitDays) || explicitDays < 0) {
      const nestedPlan = plan?.plan;
      if (nestedPlan) {
        explicitDays = Number(
          nestedPlan.dias_restantes ?? nestedPlan.days_remaining ?? nestedPlan.remaining_days,
        );
      }
    }

    if (!Number.isNaN(explicitDays) && explicitDays >= 0) {
      return Math.floor(explicitDays);
    }

    // Buscar fecha_fin en plan directo
    let endRaw =
      plan?.fecha_fin ||
      plan?.end_date ||
      plan?.fecha_vencimiento ||
      plan?.vencimiento ||
      plan?.expires_at;

    // Si no está en plan directo, buscar en nestedPlan
    if (!endRaw) {
      const nestedPlan = plan?.plan;
      if (nestedPlan) {
        endRaw =
          nestedPlan.fecha_fin ||
          nestedPlan.end_date ||
          nestedPlan.fecha_vencimiento ||
          nestedPlan.vencimiento ||
          nestedPlan.expires_at;
      }
    }

    if (!endRaw) {
      return null;
    }

    const end = new Date(endRaw).getTime();
    if (Number.isNaN(end)) {
      return null;
    }

    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  getSubscriptionDaysLabel(): string {
    const days = this.getSubscriptionDaysRemaining();

    if (days === null) {
      return 'Sin fecha';
    }

    if (days === 0) {
      return 'Vence hoy';
    }

    if (days === 1) {
      return '1 dia restante';
    }

    return `${days} dias restantes`;
  }

  getPlanProgressClass(): string {
    const days = this.getSubscriptionDaysRemaining();
    if (days === null || days < 0) return 'plan-expired';
    if (days <= 5) return 'plan-critical';
    if (days <= 15) return 'plan-warning';
    return 'plan-ok';
  }

  /*   ngAfterViewInit(): void {
    this.listenScroll();
  } */

  ngOnDestroy(): void {
    this.destroyed.next(true);
  }
  // testNotify removed (debug helper)

  private setPermissions() {
    let groups = this.user.groups.filter((g: any) => g.id === 4);
    this.isAdmin = groups.length > 0;
    groups = this.user.groups.filter((g: any) => g.id === 2 || g.id === 5);
    this.isJefeCanalWebmaster = groups.length > 0;
  }

  private loadLives() {
    this.publicationService
      .getPublications(this.livesParams)
      .subscribe((response: PictaResponse<Publication>) => {
        this.lives = this.lives.concat(response.results);
        this.livesParams.page = response.next;
      });
  }

  /*   private listenScroll() {
    this.scrollDispatcher
      .scrolled()
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        const { scrollY } = window;
        if (scrollY > 25) {
          this.renderer.addClass(
            this.toolbar._elementRef.nativeElement,
            'solid'
          );
          this.renderer.addClass(
            this.toolbar._elementRef.nativeElement,
            'mat-elevation-z18'
          );
        } else {
          this.renderer.removeClass(
            this.toolbar._elementRef.nativeElement,
            'solid'
          );
          this.renderer.removeClass(
            this.toolbar._elementRef.nativeElement,
            'mat-elevation-z18'
          );
        }
      });
  } */
}
