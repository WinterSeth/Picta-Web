import { ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit, PLATFORM_ID, signal, output, viewChild } from '@angular/core';
import { PanelCloseService } from '../../../../services/panel-close.service';
import { CineModeService } from '../../services/cine-mode.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Publication } from '../../pages/medias/models/publicacion.model';
import { LocalstorageService } from '../../../../services/localstorage.service';
import { ActivePerfilService } from '../../../../services/active-perfil.service';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import {  Router, RouterLinkActive, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MaterialHeaderComponent } from '../material-header/material-header.component';
import { MatSidenavContainer, MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemIcon, MatListModule, MatNavList } from '@angular/material/list';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { MatDividerModule } from '@angular/material/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

export interface Section {
  name: string;
  updated: Date;
}

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    imports: [
        MatSidenavContainer,
        MatSidenav,
        MatSidenavContent,
        MaterialHeaderComponent,
        RouterOutlet,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatListModule,
        RouterModule,
        RouterLinkActive,
        MatIconModule,
        MatNavList,
        MatListItem,
        MatListItemIcon,
        MatListModule, MatIconModule, MatDividerModule, MatButtonModule
    ]
})
export class LayoutComponent implements OnDestroy   {
  private closePanel = inject(PanelCloseService);
  private breakpointObserver = inject(BreakpointObserver);
  private snackBar = inject(MatSnackBar);
  private localStorage = inject(LocalstorageService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private activePerfilService = inject(ActivePerfilService);
  readonly cineModeService = inject(CineModeService);

  readonly newItemEvent = output<any>();

  observer = inject(BreakpointObserver);
  router = inject(Router);
  authService = inject(AuthService);

  userService = inject(UserService);

  usuario$ = this.userService.getUserInfo();

  title = 'Picta';
  readonly sidebar = viewChild<SidebarComponent>('sidebar');
  isActive = false;
  isVisiblePipPlayer = false;
  video: Publication;

  readonly sidenav = viewChild.required(MatSidenav);
  isMobile = false;
  isDesktop = false;
  isHomeRoute = false;
  isMediaRoute = false;
  isCollapsed = false;
  isExpanded = signal(false);

  mobileQuery: MediaQueryList;

  // Route para footer
  isShortsRoute = false;

  // Footer links and socials
  footerSocials = [
    { icon: 'img/facebook-icon.svg', link: 'https://www.facebook.com/share/18barwpBz7/', label: 'Facebook' },
    { icon: 'img/twitter-icon.svg', link: 'https://twitter.com/pictacuba', label: 'Twitter' },
    { icon: 'img/telegram-icon.svg', link: 'https://t.me/picta_comunidad', label: 'Telegram' },
    { icon: 'img/instagram-icon.svg', link: 'https://instagram.com/picta.social', label: 'Instagram' },
  ];

  footerDownloads = [
    { label: 'Picta Android TV', link: 'https://www.apklis.cu/application/cu.picta.tv', icon: 'tv' },
    { label: 'Picta Android APP', link: 'https://www.apklis.cu/application/cu.picta.android', icon: 'android' },
  ];

  footerLinks = [
    { label: 'Preguntas frecuentes', link: '/faq' },
    { label: 'Ayuda y soporte', link: '/ayuda-soporte' },
  ];

  footerLegal = [
    { label: 'Términos de uso', link: '/terms' },
    { label: 'Acerca de Picta', link: '/about' },
  ];

  isLoading;
  event;
  showUpdateDialog = true;

  folders: Section[] = [
    {
      name: 'Photos',
      updated: new Date('1/1/16'),
    },
    {
      name: 'Recipes',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Work',
      updated: new Date('1/28/16'),
    },
  ];
  notes: Section[] = [
    {
      name: 'Vacation Itinerary',
      updated: new Date('2/20/16'),
    },
    {
      name: 'Kitchen Remodel',
      updated: new Date('1/18/16'),
    },
  ];

  private _mobileQueryListener: () => void;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const localStorage = this.localStorage;
    const platformId = this.platformId;

    this.breakpointObserver.observe(Breakpoints.Handset).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      this.isMobile = result.matches;
    });
    this.breakpointObserver.observe('(min-width: 1024px)').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      this.isDesktop = result.matches;
    });
    const changeDetectorRef = inject(ChangeDetectorRef);
    const media = inject(MediaMatcher);

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    if (this.mobileQuery.addEventListener) {
      this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    } else {
      this.mobileQuery.addListener(this._mobileQueryListener);
    }
    if (isPlatformBrowser(platformId)) {
      // Detecta si es móvil
      this.breakpointObserver.observe([Breakpoints.Handset]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
        this.isMobile = result.matches;
      });
      
      // Verificar perfil activo - si no hay y no estamos en /perfil, redirigir
      // Solo si el usuario está autenticado
      if (this.authService.isLoggedIn() && !this.activePerfilService.hasActiveProfile()) {
        const currentUrl = this.router.url;
        if (currentUrl !== '/perfil' && !currentUrl.startsWith('/perfil')) {
          this.router.navigate(['/perfil']);
        }
      }
      
      const value = localStorage.getItem('showUpdateDialog');
      if (value !== null) {
        this.showUpdateDialog = JSON.parse(value);
      }
      const wasUpdated = JSON.parse(this.localStorage.getItem('app_updated'));
      if (wasUpdated) {
        this.snackBar.open('Actualización completada');
        this.localStorage.removeItem('app_updated');
        //this.openChangelog();
      }
      // initialize route-specific sidenav state
      this.isMediaRoute = !!this.router.url.match(/^\/(medias|movie|serie|radioenvivo)(\/|$)/);
      this.isShortsRoute = !!this.router.url.match(/^\/shorts(\/|$)/);
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((ev: NavigationEnd) => {
        const url = ev.urlAfterRedirects || this.router.url;
        this.isMediaRoute = !!url.match(/^\/(medias|movie|serie|radioenvivo)(\/|$)/);
        this.isShortsRoute = !!url.match(/^\/shorts(\/|$)/);
        
        // Verificar perfil activo en cada navegación
        if (this.authService.isLoggedIn() && !this.activePerfilService.hasActiveProfile()) {
          if (url !== '/perfil' && !url.startsWith('/perfil')) {
            this.router.navigate(['/perfil']);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.mobileQuery.removeEventListener) {
      this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
    } else {
      this.mobileQuery.removeListener(this._mobileQueryListener);
    }
  }

  toggleExpansion(): void {
    this.isExpanded.update(value => !value);
  }

  // Determina el modo del sidenav basado en la ruta (medias/movie/serie) y el dispositivo
  get sidenavMode() {
    return this.isMobile || this.isMediaRoute ? 'over' : 'side';
  }

  // Determina si el sidenav debe estar abierto inicialmente
  get sidenavOpened() {
    return this.isMobile ? false : !this.isMediaRoute;
  }

  addItem(newItem: string) {
    if (this.isDesktop) {
      return;
    }
    if(this.isMobile){
      this.sidenav().toggle();
      this.isCollapsed = false;
    } else {
      this.sidenav().toggle();
      this.isCollapsed = !this.isCollapsed;
    } 
  }

  toggleMenu() {
    this.sidebar().toggleSidenav();
  }

  togleSide() {
    this.sidebar().toggleSidenav();
  }

  // Close the sidenav on mobile when a navigation link is clicked
  onNavLinkClick(): void {
    if (this.isMobile) {
      try {
        this.sidenav().close();
      } catch (e) {
        // fallback: toggle if close not available
        try { this.sidenav().toggle(); } catch {}
      }
    }
  }

  isLoginIn(): boolean {
    return this.authService.isLoggedIn();
  }

  clicked() {
    this.closePanel.closeAllPanel();
  }
}
