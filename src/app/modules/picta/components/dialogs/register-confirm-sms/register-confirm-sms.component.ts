import { Component, OnDestroy, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { UserService } from '../../../../../services/user.service';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-register-confirm-sms',
    templateUrl: './register-confirm-sms.component.html',
    styleUrls: ['./register-confirm-sms.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
      MatFormField,
      MatLabel,
      MatInput,
      MatIcon,
      ReactiveFormsModule,
    ]
})
export class RegisterConfirmSmsComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private dialogData = inject<{ channel?: 'email' | 'phone'; email?: string; phone?: string }>(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject<MatDialogRef<RegisterConfirmSmsComponent>>(MatDialogRef);

  codigo: UntypedFormControl;
  errorMsg: string;
  recoveryChannel: 'email' | 'phone' = this.dialogData?.channel === 'email' ? 'email' : 'phone';
  isResendingCode = false;
  resendSecondsRemaining = 30;
  resendErrorMessage = '';
  private resendIntervalId: ReturnType<typeof setInterval> | null = null;
  subs = new SubSink();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.codigo = new UntypedFormControl('', [Validators.required]);
  }

  ngOnInit() {
    this.startResendCountdown(30);
  }

  get channelTitleLabel(): string {
    return this.recoveryChannel === 'email' ? 'correo' : 'SMS';
  }

  get channelMessageLabel(): string {
    return this.recoveryChannel === 'email' ? 'correo' : 'SMS';
  }

  verifySmsCode() {
    this.subs.add(
      this.authService.verifySmsCode(this.codigo.value).subscribe(
        (res) => {
          // Pass the full response (including tokens) back to the caller
          this.dialogRef.close(res);
        },
        (err) => {
          this.errorMsg = 'Código incorrecto';
        })
    );
  }

  resendCode() {
    if (this.isResendingCode || this.resendSecondsRemaining > 0) {
      return;
    }

    const rawPhone = (this.dialogData?.phone || '').toString().trim();
    const phoneWithPrefix = rawPhone
      ? (rawPhone.startsWith('+53') ? rawPhone : `+53${rawPhone}`)
      : '';

    const payload = this.recoveryChannel === 'email'
      ? { email: this.dialogData?.email }
      : { phone: phoneWithPrefix };

    if ((this.recoveryChannel === 'email' && !payload.email) || (this.recoveryChannel === 'phone' && !payload.phone)) {
      this.resendErrorMessage = 'No se pudo reenviar el código. Inténtelo nuevamente.';
      return;
    }

    this.isResendingCode = true;
    this.resendErrorMessage = '';

    this.subs.add(
      this.userService.resendSmsCode(payload).subscribe(() => {
        this.isResendingCode = false;
        this.startResendCountdown(30);
      }, () => {
        this.isResendingCode = false;
        this.resendErrorMessage = 'No se pudo reenviar el código. Inténtelo nuevamente.';
      })
    );
  }

  formatResendTime(): string {
    const seconds = this.resendSecondsRemaining.toString().padStart(2, '0');
    return `00:${seconds}`;
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
