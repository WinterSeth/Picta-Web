import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, DestroyRef, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { finalize, map, shareReplay } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { SolicitudService } from '../../services/solicitud.service';
import { isPlatformBrowser, NgClass, DatePipe } from '@angular/common';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { AuthService } from '../../../../../../services/auth.service';
import { UserModel } from '../../../../models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-solicitud-list',
    templateUrl: './solicitud-list.component.html',
    styleUrls: ['./solicitud-list.component.scss'],
    imports: [MatButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, RouterLink, MatDivider, MatProgressSpinner, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, NgClass, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DatePipe]
})
export class SolicitudListComponent implements OnInit  {
  private authService = inject(AuthService);
  private solicitudService = inject(SolicitudService);
  private titleService = inject(Title);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  user: UserModel;
  solicitudesCanal: any[];
  solicitudesVendedor: any[];

  innerWidth: number;
  innerHeigth: number;

  displayedColumnsCanal: string[] = ['nombre', 'alias', 'correo', 'fecha', 'estado'];
  displayedColumnsVendedor: string[] = ['nombre', 'correo', 'fecha', 'estado'];

  resultsLength = 0;
  isLoadingResults = true;

  filters = {
    user_id: 0
  };

  loading = true;
  canal: boolean = false;
  vendedor: boolean = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const platformId = this.platformId;

    if (isPlatformBrowser(platformId)) {
      this.innerWidth = window.innerWidth + 200;
      this.innerHeigth = window.innerHeight;
    }
  }

  ngOnInit() {
    this.titleService.setTitle('Mis solicitudes - Perfil');
    this.loadUser();
  }

  loadSolicitudes() {
      this.loading = true;
      this.isLoadingResults = true;
      this.solicitudService.getSolicitud(this.filters).pipe(finalize(() => {
        this.loading = false;
        this.isLoadingResults = false;
      })).subscribe((response: any) => {
        this.solicitudesCanal = response.filter(solicitud => solicitud.tipo == 'creacion_canal');
        this.solicitudesVendedor = response.filter( solicitud => solicitud.tipo == 'seller');
      });
  }

  showColumn(): string {
    return this.innerWidth > 650 ? null : 'hidden-row';
  }

  loadUser() {
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.user = user;
        this.filters.user_id = user.id;
        this.loadSolicitudes();
      } else {
        this.router.navigate(['']);
      }
    });
  }
}
