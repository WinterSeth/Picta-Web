import { Component, inject, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login-recovery-password',
  templateUrl: './login-recovery-password.component.html',
  styleUrls: ['./login-recovery-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatButtonToggleGroup,
    ReactiveFormsModule,
    MatButtonToggle,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix
  ]
})
export class LoginRecoveryPasswordComponent {
  private userService = inject(UserService);
  private fb = inject(UntypedFormBuilder);
  dialogRef = inject<MatDialogRef<LoginRecoveryPasswordComponent>>(MatDialogRef);

  channelCtrl: UntypedFormControl = this.fb.control('phone') as UntypedFormControl;
  phoneCtrl: UntypedFormControl = this.fb.control('', [Validators.minLength(8), Validators.required, Validators.maxLength(8)]) as UntypedFormControl;
  emailCtrl: UntypedFormControl = this.fb.control({ value: '', disabled: true }, [Validators.required, Validators.email]) as UntypedFormControl;

  isSending = false;
  errorMsg = '';
  subs = new SubSink();

  constructor() {
    this.channelCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe((type: string) => {
      if (type === 'phone') {
        this.phoneCtrl.enable();
        this.emailCtrl.disable();
      } else {
        this.phoneCtrl.disable();
        this.emailCtrl.enable();
      }
    });
  }

  get channelLabel(): string {
    return this.channelCtrl.value === 'phone' ? 'teléfono' : 'correo';
  }

  sendCode() {
    const isPhone = this.channelCtrl.value === 'phone';
    const phoneValue = isPhone ? `+53${this.phoneCtrl.value}` : null;
    const emailValue = isPhone ? null : this.emailCtrl.value;

    this.isSending = true;
    this.errorMsg = '';

    this.subs.add(
      this.userService.verifySms(
        isPhone ? { phone: phoneValue } : { email: emailValue }
      ).subscribe({
        next: () => {
          this.dialogRef.close({
            channel: isPhone ? 'phone' : 'email',
            phone: phoneValue,
            email: emailValue
          });
        },
        error: () => {
          this.isSending = false;
          this.phoneCtrl.setErrors({ wrong: true });
        }
      })
    );
  }
}