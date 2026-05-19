import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import {AuthService} from '../../../../../services/auth.service';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import {SubSink} from 'subsink';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';


@Component({
    selector: 'app-register-resend-sms',
    templateUrl: './register-resend-sms.component.html',
    styleUrls: ['./register-resend-sms.component.scss'],
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatFormField, MatLabel, MatInput, ReactiveFormsModule, MatDialogActions, MatButton]
})
export class RegisterResendSmsComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  dialogRef = inject<MatDialogRef<RegisterResendSmsComponent>>(MatDialogRef);

  codigo: UntypedFormControl;
  errorMsg: string;
  subs = new SubSink();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.codigo = new UntypedFormControl('', [Validators.required]);
  }

  ngOnInit() {
  }

  verifySmsCode() {
    this.subs.add(
      this.authService.verifySmsCode(this.codigo.value).subscribe(
        (res) => {

          this.dialogRef.close(true);


        },
        (err) => {
          this.errorMsg = 'Código incorrecto';
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
