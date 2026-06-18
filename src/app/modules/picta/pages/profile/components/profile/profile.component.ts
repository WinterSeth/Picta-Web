import { Component, ElementRef, OnDestroy, OnInit, viewChild, inject } from '@angular/core';
import { AuthService } from '../../../../../../services/auth.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserModel } from '../../../../models/user.model';
import { UserService } from '../../../../../../services/user.service';
import { Title } from '@angular/platform-browser';
import { MatDatepickerInputEvent, MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { ProfileConfirmChangePswdModalComponent } from '../../../../components/dialogs/profile-confirm-change-pswd-modal/profile-confirm-change-pswd-modal.component';
import { ChangePasswordModalComponent } from '../../../../components/dialogs/change-password-modal/change-password-modal.component';
import { NotificationService } from '../../../../../../services/notification.service';
import { SubSink } from 'subsink';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SubscriptionService } from '../../../../../../services/subscription.service';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs';
import { ConfirmDialogComponent } from '../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { UpperCasePipe } from '@angular/common';
import { Credentials, CredentialsService } from '../../../../services/credentials.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare const $;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    providers: [],
    imports: [
    MatButton,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgxMaskDirective,
    MatError,
    MatSelect,
    MatOption,
    MatSlideToggle,
    MatProgressSpinner,
    UpperCasePipe
]
})
export class ProfileComponent implements OnInit, OnDestroy {
  private loginService = inject(AuthService);
  private title = inject(Title);
  private fb = inject(UntypedFormBuilder);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private subscribeService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private localStorage = inject(LocalstorageService);
  private credentials = inject(CredentialsService);

  profileForm: UntypedFormGroup;
  user: UserModel;
  changePasswordForm: UntypedFormGroup;
  long_token: string;
  changedPassword: boolean;
  tokenInvalid: boolean;
  minDate = new Date(1905, 0, 1);
  maxDate = new Date();
  selectedAvatar: File;
  readonly avatarInput = viewChild<ElementRef>('avatarInput');
  emailInUse: boolean;
  loading: boolean;
  subs = new SubSink();
  selectedImagen: string | ArrayBuffer;
  subscriptions: Observable<any[]>;
  format = 'yyyy-MM-dd';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.title.setTitle('Perfil de usuario - Picta');
    this.changedPassword = false;
    this.tokenInvalid = false;
    this.loginService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
      if (user) {
        this.user = user;
      } else {
        this.router.navigate(['']);
      }
    });
  }

  /**
   * Parsea una fecha proveniente del backend ("YYYY-MM-DD") a un objeto Date
   * usando componentes locales para evitar el offset de timezone (UTC vs local).
   * Sin esto, new Date("1902-01-01") se interpreta como UTC midnight,
   * y en GMT-5 se muestra como 1901-12-31, desplazando un día.
   */
  private parseBackendDate(dateStr: string | Date): Date | null {
    if (!dateStr) {
      return null;
    }
    if (dateStr instanceof Date) {
      return dateStr;
    }
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(+match[1], +match[2] - 1, +match[3]);
    }
    return new Date(dateStr);
  }

  /**
   * Valida que la fecha sea:
   * - Una fecha real (no NaN)
   * - Año >= 1905
   * - No en el futuro
   */
  private dateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const date = control.value;
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return { invalidDate: true };
    }
    if (date.getFullYear() < 1905) {
      return { minYear: true };
    }
    if (date > new Date()) {
      return { futureDate: true };
    }
    return null;
  }

  /**
   * Marca todos los campos como touched para que los <mat-error> se muestren.
   */
  private markAllAsTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
      this.profileForm.get(key)?.updateValueAndValidity();
    });
  }

  get fullname() {
    return `${this.user.first_name} ${this.user.last_name}`;
  }

  get savedQuality() {
    const quality = this.localStorage.getItem('quality');
    if (!quality || quality === 'null') {
      return 'auto';
    }
    return quality;
  }

  get savedLanguage() {
    return this.localStorage.getItem('language') || 'auto';
  }

  get autoPlay() {
    const value = this.localStorage.getItem('autoPlay');
    // Default true - mostrar activado si no existe o es 'true'
    return value !== 'false';
  }

  get autoSubtitle() {
    const value = this.localStorage.getItem('autoSubtitle');
    // Default true - mostrar activado si no existe o es 'true'
    return value !== 'false';
  }

  ngOnInit() {
    /*if (this.user === undefined) {
      this.subs.add(
        this.loginService.getUserData().subscribe(
          (res: any) => {
            this.loginService.setUserData(res);
            this.initProfileFrom();
            this.initSubscription();
          },
          err => {
            if (this.loginService.isLoggedIn()) {
              this.loginService.refreshToken().subscribe(data => this.loginService.setToken(data), error1 => this.loginService.logout());
            }

          })
      );
    } else {
    }*/
    this.initProfileFrom();
    this.initSubscription();
  }

  initProfileFrom() {
    this.profileForm = this.fb.group({
      first_name: [this.user?.first_name, [Validators.required]],
      last_name: [this.user?.last_name, [Validators.required]],
      phone_number: [this.user?.phone_number?.slice(3), []],
      fecha_nacimiento: [this.parseBackendDate(this.user?.fecha_nacimiento), [this.dateValidator.bind(this)]],
      email: [this.user?.email, [Validators.email]],
      avatar: [this.user?.avatar, []],
    });
    this.changePasswordForm = this.fb.group({
      short_token: ['', []],
      new_password: ['', []],
    });
  }

  getDirtyValues(form: any) {
    const dirtyValues = {};

    Object.keys(form.controls).forEach(key => {
      const currentControl = form.controls[key];

      if (currentControl.dirty) {
        if (currentControl.controls) {
          dirtyValues[key] = this.getDirtyValues(currentControl);
        } else {
          dirtyValues[key] = currentControl.value;
        }
      }
    });

    return dirtyValues;
  }

  updateUser() {
    this.markAllAsTouched();

    if (!this.profileForm.valid) {
      return;
    }

    if (this.profileForm.dirty && this.profileForm.valid) {
      const update: any = this.getDirtyValues(this.profileForm);

      if (!update.phone_number && this.profileForm.value.phone_number) {
        update.phone_number = this.profileForm.value.phone_number;
      }

      if (!update.email && this.profileForm.value.email) {
        update.email = this.profileForm.value.email;
      }

      if (!update.phone_number && !update.email) {
        this.notificationService.open(
          'error',
          'Debes proporcionar un número de teléfono o correo electrónico.'
        );
        return;
      }

      if (update.fecha_nacimiento) {
        update.fecha_nacimiento = format(update.fecha_nacimiento, this.format, {
          locale: es,
        });
      }
      this.loading = true;
      this.subs.add(
        this.userService.updateUser(this.user.id, update).subscribe(
          user => {
            this.loading = false;
            this.emailInUse = false;
            this.updateStorage(user);
            this.loginService.setUserData(user);
            this.notificationService.open(
              'ok',
              'Información actualizada correctamente.',
            );
          },
          err => {
            this.loading = false;
            if (err.error.email) {
              this.emailInUse = true;
            }
          },
        ),
      );
    }
  }

  addEvent($event: MatDatepickerInputEvent<any & Date>) {
    // const fecha = format($event.value, this.format, {locale: es});
    this.profileForm.get('fecha_nacimiento').markAsDirty();
  }

  openRecoveryModal() {
    const dialog = this.dialog.open(ProfileConfirmChangePswdModalComponent);
    dialog.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.sendRecoverySms();
      }
    });
  }

  sendRecoverySms() {
    this.subs.add(
      this.userService
        .verifySms({ phone: this.user.phone_number })
        .subscribe((res: any) => {
          this.openChangePswdModal();
        })
    );
  }

  selectAvatar(avatarInput: HTMLInputElement) {
    this.selectedAvatar = avatarInput.files[0];
    const avatar = this.blobToFile(avatarInput.files[0], 'img.jpeg');
    this.profileForm.patchValue({ avatar });
    this.profileForm.get('avatar').markAsDirty();
    const fr = new FileReader();
    fr.readAsDataURL(avatar);
    fr.onload = () => {
      this.selectedImagen = fr.result;
    };
  }

  public blobToFile = (theBlob: Blob, fileName: string): File => {
    return new File([theBlob], fileName, {
      type: theBlob.type,
      lastModified: Date.now(),
    });
  };

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  clickAvatar() {
    this.avatarInput().nativeElement.click();
  }

  initSubscription() {
    if (this.user) {
      this.subscriptions = this.subscribeService
        .getAllSubscriptionsByUser({ usuarioNombre: this.user.username })
        .pipe(pluck('results'));
    }
  }

  removeAccount() {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        msg: '¿Estás seguro que deseas eliminar tu cuenta?',
      },
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.userService.disableUser(this.user.id).subscribe(() => {
          this.authService.logout();
          this.router.navigate(['']);
          this.notificationService.open(
            'ok',
            'Su cuenta ha sido eliminada correctamente.',
          );
        });
      }
    });
  }

  selectQuality({ value }) {
    this.localStorage.setItem('quality', value === 'auto' ? 'auto' : String(value));
  }

  selectLanguage({ value }) {
    this.localStorage.setItem('language', value);
  }

  setAutoPlay({ checked }) {
    this.localStorage.setItem('autoPlay', JSON.stringify(checked));
  }

  setSubtitle({ checked }) {
    this.localStorage.setItem('autoSubtitle', JSON.stringify(checked));
  }

  private openChangePswdModal() {
    const dialog = this.dialog.open(ChangePasswordModalComponent, {
      disableClose: true,
      width: '440px',
      minWidth: '340px',
      panelClass: 'picta-dark-dialog'
    });

    dialog.afterClosed().subscribe((result: boolean) => {
      this.changedPassword = result;
      if (this.changedPassword) {
        this.notificationService.open(
          'ok',
          'Se ha cambiado su contraseña correctamente. Estará vigente a partir de su próximo inicio de sesión.',
        );
        this.long_token = null;
      }
    });
  }

  updateStorage(user) {
    const currentCredentials = this.credentials.credentials;
    const updatedCredentials = {
      ...currentCredentials, 
      user: {
        ...user,
      },
    };
    this.credentials.setCredentials(updatedCredentials as Credentials);
  }
}
