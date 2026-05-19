import { Component, ElementRef, OnInit, viewChild, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipGrid, MatChip, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import {catchError, debounceTime, distinctUntilChanged, finalize, retry, startWith, switchMap} from 'rxjs';
import {Observable, of, throwError} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import {CanalService} from '../../../canal/services/canal-service.service';
import {PalabrasClavesService} from '../../services/palabras-claves.service';
import {UserService} from '../../../../../../services/user.service';
import {SolicitudService} from '../../services/solicitud.service';
import {MatCheckbox} from '@angular/material/checkbox';
import {TermsDialogComponent} from '../../../register/components/terms-dialog/terms-dialog.component';
import { MatDialog, MatDialogContent } from '@angular/material/dialog';
import {LoaderService} from '../../../../services/loader.service';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';


@Component({
    selector: 'app-request-channel-dialog',
    templateUrl: './request-channel-dialog.component.html',
    styleUrls: ['./request-channel-dialog.component.scss'],
    imports: [MatDialogContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatChipGrid, MatChip, MatIcon, MatChipRemove, MatAutocompleteTrigger, MatChipInput, MatAutocomplete, MatOption, MatSlideToggle, MatButton, MatCheckbox, RouterLink, AsyncPipe]
})
export class RequestChannelDialogComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private canalService = inject(CanalService);
  private loaderService = inject(LoaderService);
  private palabrasClavesService = inject(PalabrasClavesService);
  private userService = inject(UserService);
  private solicitudService = inject(SolicitudService);
  private dialog = inject(MatDialog);

  form: UntypedFormGroup;

  selectedPortada: string | ArrayBuffer;

  selectedAvatar: string | ArrayBuffer;
  selectedPalabras = [];
  selectedUsuarios = [];
  palabrasFiltradas: Observable<any>;
  usersFiltrados: Observable<any>;
  readonly palabrasInput = viewChild<ElementRef<HTMLInputElement>>('palabrasInput');
  readonly chipList = viewChild<MatChipGrid>('chipList');
  readonly chipListUser = viewChild<MatChipGrid>('chipListUser');
  palabrasCtrl = new UntypedFormControl();
  usersCtrl = new UntypedFormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  palabras;
  usuarios;
  wordsIds = [];
  usersIds = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit(): void {
    this.listenPalabraCtrl();
    this.initForm();
  }

  async save() {
    if (this.selectedPalabras.length === 0) {
      this.chipList().errorState = true;
    }
    await this.createWordList();
    if (this.form.valid) {
      const data = this.form.value;
      this.loaderService.show();
      const solicitud = {
        tipo: 'creacion_canal',
        data
      };
      this.solicitudService.create(solicitud)
        .pipe(
          catchError(err => {
            this.snackBar.open('Ocurrió un error al enviar la solicitud. Error:' + JSON.stringify(err.error))
            return throwError(err);
          }),
          finalize((() => this.loaderService.hide()))
        )
        .subscribe(() => {
          this.snackBar.open('Su solicitud ha sido enviada correctamente.');
          this.form.reset();
          this.router.navigateByUrl('/profile/following');
        });

    } else {
      //console.log(this.form);
    }
  }

  selectPortada(imagen: HTMLInputElement) {
    const image = this.blobToFile(imagen.files[0], 'img.jpeg');
    const fr = new FileReader();
    fr.readAsDataURL(image);
    fr.onload = () => {
      this.selectedPortada = fr.result;
      this.form.patchValue({urlimagen: this.selectedPortada});
    };
  }

  selectAvatar(imagen: HTMLInputElement) {
    const image = this.blobToFile(imagen.files[0], 'img.jpeg');
    const fr = new FileReader();
    fr.readAsDataURL(image);
    fr.onload = () => {
      this.selectedAvatar = fr.result;
      this.form.patchValue({urlavatar: this.selectedAvatar});
    };
  }

  selectImagenAvatarDialog($event: MouseEvent, imagen: HTMLInputElement) {
    $event.preventDefault();
    imagen.click();
  }

  selectImagenPortadaDialog($event: MouseEvent, imagen: HTMLInputElement) {
    $event.preventDefault();
    imagen.click();
  }

  public blobToFile = (theBlob: Blob, fileName: string): File => {
    return new File([theBlob], fileName, {type: theBlob.type, lastModified: Date.now()});
  };

  remove(palabra: string): void {
    const index = this.selectedPalabras.indexOf(palabra);

    if (index >= 0) {
      this.selectedPalabras.splice(index, 1);
      this.wordsIds.splice(index, 1);

    }
    if (this.selectedPalabras.length === 0) {
      this.chipList().errorState = true;

    }
  }

  removeUser(username: string): void {
    const index = this.selectedUsuarios.indexOf(username);

    if (index >= 0) {
      this.selectedUsuarios.splice(index, 1);
      this.usersIds.splice(index, 1);
    }
    if (this.selectedUsuarios.length === 0) {
      this.chipListUser().errorState = true;

    }
  }

  add($event: MatChipInputEvent) {
    if ($event.value.trim()) {
      const word = $event.value.trim();
      this.selectedPalabras.push(word);
      this.createWord(word);
      this.form.get('palabraClave').markAsDirty();

    }
    $event.input.value = '';
    this.palabrasCtrl.setValue(null);
    this.chipList().errorState = false;
  }

  addUser($event: MatChipInputEvent) {
    const user: any = $event.value;
    if (user) {
      this.selectedUsuarios.push(user.username);
      this.usersIds.push(user.id);
    }
    this.form.get('usuarios').markAsDirty();

    $event.input.value = '';
    this.palabrasCtrl.setValue(null);
    this.chipList().errorState = false;
  }

  createWordList() {
    return new Promise<void>(resolve => {
      this.form.patchValue({palabraClave: this.wordsIds.toString()});
      resolve();

    });
  }

  createUserList() {
    return new Promise<void>(resolve => {
      this.form.patchValue({usuarios: this.usersIds});
      resolve();
    });
  }

  createWord(word: string) {
    this.palabrasClavesService.create(word).subscribe((newWord: any) => {
      this.wordsIds = [...this.wordsIds, newWord.id];
    });
  }

  get invalid(): boolean {
    return this.form.invalid || !this.selectedPalabras;
  }

  selected($event: MatAutocompleteSelectedEvent) {
    this.selectedPalabras.push($event.option.value.palabra);
    this.wordsIds = [...this.wordsIds, $event.option.value.id];
    this.palabrasInput().nativeElement.value = '';
    this.palabrasCtrl.setValue(null);
    this.chipList().errorState = false;
  }

  selectedUser($event: MatAutocompleteSelectedEvent, userInput) {
    this.selectedUsuarios.push($event.option.value.username);
    this.usersIds.push($event.option.value.id);
    this.usersCtrl.setValue('');
    userInput.value = '';

    this.chipListUser().errorState = false;
  }

  listenPalabraCtrl() {
    this.palabrasFiltradas = this.palabrasCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(300),
      distinctUntilChanged(),
      retry(-1),
      switchMap((palabra: string | null) => palabra ? this.palabrasClavesService.getByQuery({palabra__wildcard: palabra + '*'}) : of([])));
  }

  listeUserCtrl() {
    this.usersFiltrados = this.usersCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(300),
      distinctUntilChanged(),
      retry(-1),
      switchMap((username: string | null) => this.userService.getAllUsers({username__wildcard: username + '*'})));
  }

  loadPalabrasClaves() {
    this.palabrasClavesService.getAll().subscribe((response: any) => {
      this.palabras = response;
      this.listenPalabraCtrl();

    });
  }

  loadUsuarios() {
    this.userService.getAllUsers().subscribe((response: any) => {
      this.usuarios = response;
      this.listeUserCtrl();

    });
  }

  private initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      alias: ['', [Validators.required]],
      tipo: ['creacion_canal', [Validators.required]],
      descripcion: ['', [Validators.required]],
      urlimagen: ['', [Validators.required]],
      email_notification: ['', [Validators.required, Validators.email]],
      urlavatar: ['', [Validators.required]],
      palabraClave: [[], []],
      publicado: [true, [Validators.required]],
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.palabras.filter(item => item.palabra.toLowerCase().startsWith(filterValue));
  }

  private _filterUser(value: string): string[] {
    const filterValue = value.toLowerCase();
    this.userService.getAllUsers({username__wildcard: filterValue}).subscribe();
    return this.usuarios.filter(item => item.username.toLowerCase().startsWith(filterValue));
  }

  openTCU(evt, checkBoxTerm: MatCheckbox) {
    evt.preventDefault();
    evt.stopPropagation();
    const dialogRef = this.dialog.open(TermsDialogComponent, { maxHeight: '90vh', width: '440px', minWidth: '340px', panelClass: 'picta-dark-dialog' });
    dialogRef.afterClosed().subscribe(result => {
      checkBoxTerm.checked = result;
    });
  }
}
