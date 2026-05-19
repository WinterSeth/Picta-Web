import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { UserModel } from '../../../../models/user.model';
import { AuthService } from '../../../../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PremiumDialogComponent } from '../premium-dialog/premium-dialog.component';
import { MatList, MatListItem, MatListItemIcon } from '@angular/material/list';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-profile-sidenav',
    templateUrl: './profile-sidenav.component.html',
    styleUrls: ['./profile-sidenav.component.scss'],
    imports: [
    MatList,
    MatListItem,
    MatIcon,
    MatListItemIcon,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    UpperCasePipe,
    DatePipe,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel
]
})
export class ProfileSidenavComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private iconRegistry = inject(MatIconRegistry);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  user: UserModel;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const iconRegistry = this.iconRegistry;
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIcon(
      'crown',
      sanitizer.bypassSecurityTrustResourceUrl(
        'img/examples/thumbup-icon.svg'
      )
    );
  }

  get isAdmin() {
    // return this.user.groups.some((g: any) => g.id === 2 || g.id === 5 || g.id === 4);
    return this.user.groups.some(
      (g: any) => g.name === 'Administrador' || g.name === 'Webmaster'
    );
  }

  ngOnInit(): void {
    this.loadUser();
  }

  goPremium() {
    this.dialog.open(PremiumDialogComponent, {
      closeOnNavigation: true,
      height: '90vh',
      data: {
        user: this.user.username,
      },
    });
  }

  private loadUser() {
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.user = user;
      } else {
        this.router.navigate(['']);
      }
    });
  }
}
