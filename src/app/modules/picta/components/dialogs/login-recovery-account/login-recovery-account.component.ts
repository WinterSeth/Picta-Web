import { Component, inject, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { NgxMaskDirective } from 'ngx-mask';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login-recovery-account',
  templateUrl: './login-recovery-account.component.html',
  styleUrls: ['./login-recovery-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatButtonToggleGroup,
    ReactiveFormsModule,
    MatButtonToggle,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    NgxMaskDirective
  ]
})
export class LoginRecoveryAccountComponent {
  private userService = inject(UserService);
  private fb = inject(UntypedFormBuilder);
  dialogRef = inject<MatDialogRef<LoginRecoveryAccountComponent>>(MatDialogRef);

  channelCtrl: UntypedFormControl = this.fb.control('email') as UntypedFormControl;
  phoneCtrl: UntypedFormControl = this.fb.control('', [Validators.minLength(8), Validators.maxLength(8)]) as UntypedFormControl;
  emailCtrl: UntypedFormControl = this.fb.control('', [Validators.email, Validators.required]) as UntypedFormControl;

  isSending = false;
  errorMsg = '';
  resendSecondsRemaining = 0;
  private resendIntervalId: ReturnType<typeof setInterval> | null = null;
  subs = new SubSink();

  constructor() {
    this.channelCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value: boolean) => {
      if (value) {
        this.phoneCtrl.disable();
        this.emailCtrl.enable();
      } else {
        this.phoneCtrl.enable();
        this.emailCtrl.disable();
      }
    });
  }

  get channelLabel(): string {
    return this.channelCtrl.value === 'email' ? 'correo' : 'teléfono';
  }

  sendCode() {
    const isEmail = this.channelCtrl.value === 'email';
    const payload = isEmail
      ? { email: this.emailCtrl.value }
      : { phone: `+53${this.phoneCtrl.value}` };

    this.isSending = true;
    this.errorMsg = '';

    this.subs.add(
      this.userService.resendSmsCode(payload).subscribe({
        next: () => {
          this.isSending = false;
          this.dialogRef.close({
            channel: isEmail ? 'email' : 'phone',
            email: isEmail ? this.emailCtrl.value : null,
            phone: isEmail ? null : `+53${this.phoneCtrl.value}`
          });
        },
        error: (err) => {
          this.isSending = false;
          this.errorMsg = err?.error?.detail || err?.error?.message || 'No se pudo enviar el código.';
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

  ngOnDestroy(): void {
    this.clearResendCountdown();
    this.subs.unsubscribe();
  }
}