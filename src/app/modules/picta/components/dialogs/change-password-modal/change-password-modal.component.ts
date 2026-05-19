import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../../../services/user.service';
import { SubSink } from 'subsink';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon]
})
export class ChangePasswordModalComponent implements OnInit, OnDestroy {
  private fb = inject(UntypedFormBuilder);
  dialogRef = inject<MatDialogRef<ChangePasswordModalComponent>>(MatDialogRef);
  private userService = inject(UserService);
  private dialogData = inject<{ channel?: 'email' | 'phone'; email?: string; phone?: string }>(MAT_DIALOG_DATA, { optional: true });

  changePasswordForm: UntypedFormGroup = this.fb.group({
    short_token: ['', []],
    new_password: ['', []],
    confirm_password: ['', []],
  });

  passwordMismatchError = signal(false);
  passwordTooShortError = signal(false);
  isSubmitting = signal(false);

  tokenInvalid = false;
  errorMsg = '';
  changedPassword = false;
  recoveryChannel: 'email' | 'phone' = this.dialogData?.channel === 'email' ? 'email' : 'phone';
  isResending = false;
  resendSecondsRemaining = 60;
  private resendIntervalId: ReturnType<typeof setInterval> | null = null;
  subs = new SubSink();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.startResendCountdown(60);
    // Validar coincidencia de contraseñas en tiempo real
    this.changePasswordForm.valueChanges.subscribe(() => {
      this.checkPasswordMismatch();
      this.checkPasswordMinLength();
    });
  }

  checkPasswordMismatch() {
    const pw = this.changePasswordForm.get('new_password')?.value;
    const cpw = this.changePasswordForm.get('confirm_password')?.value;
    const mismatch = Boolean(pw) && Boolean(cpw) && pw !== cpw;
    this.passwordMismatchError.set(mismatch);
  }

  checkPasswordMinLength() {
    const pw = this.changePasswordForm.get('new_password')?.value;
    this.passwordTooShortError.set(Boolean(pw) && pw.length < 8);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearResendCountdown();
    this.subs.unsubscribe();
  }

  get channelLabel(): string {
    return this.recoveryChannel === 'email' ? 'correo' : 'número';
  }

  changePassword() {
    if (this.isSubmitting()) return;
    
    this.isSubmitting.set(true);
    this.subs.add(
      this.userService.changePassword(this.changePasswordForm.value).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.changedPassword = true;
          this.dialogRef.close(this.changedPassword);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.tokenInvalid = true;
        }
      })
    );
  }

  resendCode() {
    if (this.isResending || this.resendSecondsRemaining > 0) {
      return;
    }

    const rawPhone = (this.dialogData?.phone || '').toString().trim();
    const phoneWithPrefix = rawPhone.startsWith('+53') ? rawPhone : `+53${rawPhone}`;

    const payload = this.recoveryChannel === 'email'
      ? { email: this.dialogData?.email }
      : { phone: phoneWithPrefix };

    if ((this.recoveryChannel === 'email' && !payload.email) || (this.recoveryChannel === 'phone' && !payload.phone)) {
      this.errorMsg = 'No se pudo reenviar el código. Inténtelo nuevamente.';
      return;
    }

    this.isResending = true;
    this.errorMsg = '';

    this.subs.add(
      this.userService.verifySms(payload).pipe(
        catchError(() => this.userService.resendSmsCode(payload))
      ).subscribe({
        next: () => {
          this.isResending = false;
          this.startResendCountdown(60);
        },
        error: () => {
          this.isResending = false;
          this.errorMsg = 'No se pudo reenviar el código. Inténtelo nuevamente.';
        }
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
      } else {
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
}