import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef  } from '@angular/material/dialog';
import {UserService} from '../../../../../services/user.service';
import {SubSink} from 'subsink';
import {Credentials, CredentialsService } from '../../../services/credentials.service';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-recovery-account-modal',
    templateUrl: './recovery-account-modal.component.html',
    styleUrls: ['./recovery-account-modal.component.scss'],
    imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon]
})
export class RecoveryAccountModalComponent implements OnInit, OnDestroy {
  private fb = inject(UntypedFormBuilder);
  dialogRef = inject<MatDialogRef<RecoveryAccountModalComponent>>(MatDialogRef);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private credentialsService = inject(CredentialsService);
  private dialogData = inject<{ channel?: 'email' | 'phone'; email?: string; phone?: string }>(MAT_DIALOG_DATA, { optional: true });

  changePasswordForm: UntypedFormGroup;
  tokenInvalid: boolean = false;
  changedPassword: boolean = false;
  isVerifying = false;
  verifyErrorMessage = '';
  isResending = false;
  resendSecondsRemaining = 60;
  errorMsg = '';
  private resendIntervalId: ReturnType<typeof setInterval> | null = null;
  recoveryChannel: 'email' | 'phone' = this.dialogData?.channel === 'email' ? 'email' : 'phone';
  subs = new SubSink();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.changePasswordForm = this.fb.group({
      'short_token': ['', []]
    });
  }

  ngOnInit() {
    this.startResendCountdown(60);
  }

  get channelLabel(): string {
    return this.recoveryChannel === 'email' ? 'correo' : 'número';
  }

  get channelTitleLabel(): string {
    return this.recoveryChannel === 'email' ? 'correo' : 'SMS';
  }

  activateAccount() {
    if (this.isVerifying || !this.changePasswordForm.value.short_token) {
      return;
    }

    this.isVerifying = true;
    this.tokenInvalid = false;
    this.verifyErrorMessage = '';
    
    this.subs.add(
      
      this.authService.verifySmsCode(this.changePasswordForm.value.short_token).subscribe((res: any) => {
          const access_token = res.access_token;
          const refresh_token = res.refresh_token;
          const credentials: Credentials = {access_token, refresh_token};

          this.credentialsService.setCredentials(credentials);
          this.authService.getUserData().subscribe((resp: any) => {
            this.credentialsService.setCredentials({user: resp, ...credentials});
            this.authService.setUserData(resp);
            this.isVerifying = false;
            this.changedPassword = true;
            this.dialogRef.close(this.changedPassword);
          }, () => {
            this.isVerifying = false;
            this.changedPassword = true;
            this.dialogRef.close(this.changedPassword);
          });
          
        },
        error1 => {
          this.isVerifying = false;
          this.tokenInvalid = true;
          this.verifyErrorMessage = error1?.error?.detail || error1?.error?.message || 'Código inválido o expirado. Inténtelo nuevamente.';
        })
    );
  }

  resendCode() {
    if (this.isResending || this.resendSecondsRemaining > 0) {
      return;
    }

    const payload = this.recoveryChannel === 'email'
      ? { email: this.dialogData?.email }
      : { phone: this.dialogData?.phone };

    if ((this.recoveryChannel === 'email' && !payload.email) || (this.recoveryChannel === 'phone' && !payload.phone)) {
      this.errorMsg = 'No se pudo reenviar el código. Inténtelo nuevamente.';
      return;
    }

    this.isResending = true;
    this.errorMsg = '';

    this.subs.add(
      this.userService.resendSmsCode(payload).subscribe(() => {
        this.isResending = false;
        this.startResendCountdown(60);
      }, () => {
        this.isResending = false;
        this.errorMsg = 'No se pudo reenviar el código. Inténtelo nuevamente.';
      })
    );
  }

  formatResendTime(): string {
    const minutes = Math.floor(this.resendSecondsRemaining / 60).toString().padStart(2, '0');
    const seconds = (this.resendSecondsRemaining % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private startResendCountdown(seconds: number): void {
    this.clearResendCountdown();
    this.resendSecondsRemaining = seconds;
    this.resendIntervalId = setInterval(() => {
      if (this.resendSecondsRemaining > 0) {
        this.resendSecondsRemaining -= 1;
      }

      if (this.resendSecondsRemaining <= 0) {
        this.clearResendCountdown();
      }
    }, 1000);
  }

  private clearResendCountdown(): void {
    if (this.resendIntervalId) {
      clearInterval(this.resendIntervalId);
      this.resendIntervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.clearResendCountdown();
    this.subs.unsubscribe();
  }
}
