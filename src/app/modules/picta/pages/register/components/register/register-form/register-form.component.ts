import { Component, signal, WritableSignal, OnDestroy, OnInit, output, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../../../../../../validators/custom-validators';
import { AuthService } from '../../../../../../../services/auth.service';
import { RegisterConfirmSmsComponent } from '../../../../../components/dialogs/register-confirm-sms/register-confirm-sms.component';
import { NotificationService } from '../../../../../../../services/notification.service';
import { SubSink } from 'subsink';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Credentials, CredentialsService } from '../../../../../services/credentials.service';
import { TermsDialogComponent } from '../../terms-dialog/terms-dialog.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  imports: [
    MatButtonToggleModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatSuffix,
    MatTooltip,
    MatIcon,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    NgxMaskDirective,
    MatCheckbox,
    RouterLink,
    MatProgressSpinner
  ]
})
export class RegisterFormComponent implements OnInit, OnDestroy {
  private fb = inject(UntypedFormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private credentialsService = inject(CredentialsService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    // Validar coincidencia de contraseñas en tiempo real
    this.registerForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const pw = this.registerForm.get('password')?.value;
      const rp = this.registerForm.get('repeat_password')?.value;
      this.passwordMismatchError.set(!!pw && !!rp && pw !== rp);
    });
  }

  registerForm: UntypedFormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.pattern('^[\\w.@+-]+$')]],
    phone_number: ['', []],
    email: ['', [Validators.email, Validators.required]],
    fecha_nacimiento: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    repeat_password: ['', [Validators.required]],
    with_mail: [true, []],
  }, {
    validator: CustomValidators.passwordMatchValidator
  });
  verifySms: UntypedFormGroup;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  format = 'yyyy-MM-dd';
  registerSuccess = false;
  loading = false;
  showPass = signal(false);
  isSubmitting = signal(false);
  generalError = signal('');
  userMsg = signal('');
  // Errores por campo — key = nombre del campo del form, value = mensaje de la API
  fieldErrors: Record<string, WritableSignal<string>> = {
    email: signal(''),
    username: signal(''),
    phone_number: signal(''),
  };
  passwordMismatchError = signal(false);
  authUser: { access_token: string; refresh_token: string } = { access_token: '', refresh_token: '' };
  subs = new SubSink();
  readonly registerCompleted = output();

  ngOnInit() {}

  register() {
    // Limpiar mensajes antes de enviar
    this.generalError.set('');
    this.userMsg.set('');
    Object.values(this.fieldErrors).forEach((s) => s.set(''));
    this.isSubmitting.set(true);

    const raw = this.registerForm.getRawValue();
    const withMail = raw.with_mail ?? true;
    const registerData = {
      username: raw.username,
      password: raw.password,
      fecha_nacimiento: format(raw.fecha_nacimiento, this.format, { locale: es }),
      with_mail: withMail,
    };

    // Solo enviar el canal seleccionado
    if (withMail) {
      (registerData as any).email = raw.email;
    } else {
      (registerData as any).phone_number = raw.phone_number;
    }

    this.subs.add(
      this.authService.register(registerData).subscribe({
        next: () => {
          this.loading = true;
          this.openModalConfirmSmsRegistration();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const apiErrors = error.error ?? {};
          const fieldKeys = Object.keys(this.fieldErrors);
          const hasFieldErrors = fieldKeys.some((k) => apiErrors[k]);
          const generalKeys = ['non_field_errors', 'detail', 'message'];

          if (hasFieldErrors) {
            // Distribuir errores de la API a cada campo correspondiente
            fieldKeys.forEach((k) => {
              if (apiErrors[k]) {
                this.fieldErrors[k].set(apiErrors[k][0]);
              }
            });
          } else {
            // Error general sin campo específico
            const generalKey = generalKeys.find((k) => apiErrors[k]);
            this.generalError.set(
              generalKey ? apiErrors[generalKey] : 'Ha ocurrido un error. Inténtalo de nuevo.'
            );
          }

          // Errores de username con sugerencias
          if (apiErrors.username && apiErrors.username[0] === 'Este campo debe ser único.') {
            this.authService.get_username(registerData.username).subscribe({
              next: (res: any) => {
                this.userMsg.set('Disponibles: ' + res.toString());
              }
            });
          }
        }
      })
    );
  }

  openModalConfirmSmsRegistration() {
    const channel: 'email' | 'phone' = this.registerForm.get('with_mail').value ? 'email' : 'phone';
    const rawForm = this.registerForm.getRawValue();
    const confirmSmsDialog = this.dialog.open(RegisterConfirmSmsComponent, {
      disableClose: true,
      width: '440px',
      minWidth: '340px',
      panelClass: 'picta-dark-dialog',
      data: { channel, email: rawForm.email, phone: rawForm.phone_number }
    });
    confirmSmsDialog.afterClosed().subscribe((result: any) => {
      this.isSubmitting.set(false);
      if (result && result.access_token) {
        // sms_verify ya devolvió los tokens — usarlos directamente
        this.loading = false;
        this.registerSuccess = true;
        this.notificationService.open('ok', 'Registro completado correctamente.');
        const { access_token, refresh_token } = result;
        const credentials: Credentials = { access_token, refresh_token };
        this.credentialsService.setCredentials(credentials);
        this.authService.getUserData().subscribe((res: any) => {
          this.credentialsService.setCredentials({ user: res, ...credentials });
          this.authService.setUserData(res);
        });
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  openTCU(evt: Event, checkBoxTerm: MatCheckbox) {
    evt.preventDefault();
    evt.stopPropagation();
    const dialogRef = this.dialog.open(TermsDialogComponent, { maxHeight: '90vh', width: '440px', minWidth: '340px', panelClass: 'picta-dark-dialog' });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      checkBoxTerm.checked = result;
    });
  }

  toggleVisibility(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    this.showPass.update((v) => !v);
  }
}