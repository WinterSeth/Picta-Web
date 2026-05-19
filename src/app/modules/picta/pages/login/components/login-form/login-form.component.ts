import { Component, signal, OnDestroy, OnInit, output, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../../services/auth.service';
import { ActivePerfilService } from '../../../../../../services/active-perfil.service';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginRecoveryPasswordComponent } from '../../../../components/dialogs/login-recovery-password/login-recovery-password.component';
import { ChangePasswordModalComponent } from '../../../../components/dialogs/change-password-modal/change-password-modal.component';
import { NotificationService } from '../../../../../../services/notification.service';
import { SubSink } from 'subsink';
import { switchMap, tap } from 'rxjs';
import { Credentials, CredentialsService } from '../../../../services/credentials.service';
import { NgOptimizedImage } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { LoginRecoveryAccountComponent } from '../../../../components/dialogs/login-recovery-account/login-recovery-account.component';
import { RecoveryAccountModalComponent } from '../../../../components/dialogs/recovery-account-modal/recovery-account-modal.component';
import { LocalstorageService } from '../../../../../../services/localstorage.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgOptimizedImage,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatSuffix,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    RouterLink
  ]
})
export class LoginFormComponent implements OnDestroy, OnInit {
  private fb = inject(UntypedFormBuilder);
  private loginService = inject(AuthService);
  private activePerfilService = inject(ActivePerfilService);
  private router = inject(Router);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private credentialsService = inject(CredentialsService);
  private localstorage = inject(LocalstorageService);

  pendingRedirectUrl: string | null = null;

  loginForm: UntypedFormGroup = this.fb.group({
    code: ['+53', Validators.required],
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  changePasswordForm: UntypedFormGroup = this.fb.group({
    long_token: ['', []],
    short_token: ['', []],
    new_password: ['', []],
  });

  error = signal('');
  isLoggingIn = signal(false);
  showPass = signal(false);
  long_token: any;
  subs = new SubSink();
  readonly loggedIn = output();

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    // Recover pending redirect URL if exists
    const pendingUrl = this.localstorage.getItem('pending_redirect_url');
    if (pendingUrl) {
      this.pendingRedirectUrl = pendingUrl;
      this.localstorage.removeItem('pending_redirect_url');
    }
  }

  login() {
    this.error.set('');
    this.isLoggingIn.set(true);

    this.subs.add(
      this.loginService.login(this.loginForm).pipe(
        tap((response: any) => {
          // Response now includes headers with X-Device-Id saved in auth.service
          const { access_token, refresh_token } = response.body || response;
          const credentials: Credentials = { access_token, refresh_token };
          this.credentialsService.setCredentials(credentials);
        }),
        switchMap(() => this.loginService.getUserData())
      ).subscribe({
        next: (res: any) => {
          this.isLoggingIn.set(false);
          this.credentialsService.setCredentials({ user: res, ...this.credentialsService.credentials });
          this.loginService.setUserData(res);
          this.loggedIn.emit();
          
          // Redirect to original destination or profile selector after login
          if (this.pendingRedirectUrl) {
            this.router.navigateByUrl(this.pendingRedirectUrl);
          } else {
            this.router.navigate(['/perfil']);
          }
        },
        error: (err) => {
          this.isLoggingIn.set(false);
          if (err.status === 401 || err.status === 400) {
            this.error.set('Usuario o Contraseña Incorrecta.');
          } else {
            this.error.set('Ha ocurrido un error. Inténtalo de nuevo.');
          }
        }
      })
    );
  }

  openRecoveryModal() {
    const recoveryPasswordModal = this.dialog.open(LoginRecoveryPasswordComponent, {
      disableClose: true,
      width: '440px',
      minWidth: '340px',
      panelClass: 'picta-dark-dialog'
    });
    recoveryPasswordModal.afterClosed().subscribe((result) => {
      if (result) {
        this.openChangePasswordModal(result.channel, result.email, result.phone);
      }
    });
  }

  activateModal() {
    const activateModal = this.dialog.open(LoginRecoveryAccountComponent, {
      disableClose: true,
      width: '440px',
      minWidth: '340px',
      panelClass: 'picta-dark-dialog'
    });
    activateModal.afterClosed().subscribe((result) => {
      if (result) {
        this.openActivateModal(result.channel, result.email, result.phone);
      }
    });
  }

  openActivateModal(channel: 'email' | 'phone' = 'phone', email?: string, phone?: string) {
    const changePassWdModal = this.dialog.open(RecoveryAccountModalComponent, {
      disableClose: true,
      width: '440px',
      minWidth: '340px',
      panelClass: 'picta-dark-dialog',
      data: { channel, email, phone }
    });
    changePassWdModal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.notificationService.open(
          'ok',
          'Su cuenta se ha activado correctamente.'
        );
        this.loggedIn.emit();
        this.router.navigate(['/']);
      }
    });
  }

  openChangePasswordModal(channel: 'email' | 'phone' = 'phone', email?: string, phone?: string) {
    const changePassWdModal = this.dialog.open(ChangePasswordModalComponent, {
      disableClose: true,
      width: '440px',
      minWidth: '340px',
      panelClass: 'picta-dark-dialog',
      data: { channel, email, phone }
    });
    changePassWdModal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.notificationService.open(
          'ok',
          'Se ha cambiado su contraseña correctamente. Estará vigente a partir de su próximo inicio de sesión.'
        );
      }
    });
  }

  toggleVisibility(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    this.showPass.update((v) => !v);
  }
}