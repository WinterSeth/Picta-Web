import { Component, OnInit, input, output, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { LocationService } from '../../services/location.service';
import { catchError, finalize, map, startWith, tap } from 'rxjs';
import { SolicitudService } from '../../services/solicitud.service';
import { LoaderService } from '../../../../services/loader.service';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { AsyncPipe } from '@angular/common';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-solicitud-form',
    templateUrl: './solicitud-form.component.html',
    styleUrls: ['./solicitud-form.component.scss'],
    imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatRadioGroup,
    MatRadioButton,
    MatError,
    NgxMaskDirective,
    MatSelect,
    MatOption,
    MatButton,
    RouterLink,
    AsyncPipe
]
})
export class SolicitudFormComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);
  private snackBar = inject(MatSnackBar);
  private solicitudService = inject(SolicitudService);
  private loaderService = inject(LoaderService);
  private router = inject(Router);
  private locationService = inject(LocationService);

  readonly operacion = input<'ADD' | 'EDIT'>('ADD');
  readonly data = input<any>(undefined);
  form: UntypedFormGroup;
  readonly saveData = output();
  provinces$: Observable<any[]>;
  municipalities$: Observable<any[]>;
  loadingProvinces = true;
  loadingMunicipalities = false;

  codigo: string = "REUUP";

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.provinces$ = this.locationService.getProvinces().pipe(
      map(response => response.results),
      finalize(() => (this.loadingProvinces = false))
    );
    /*this.municipalities$ = this.locationService.getMunicipalities({limit: 200}).pipe(
      map(response => response.results),
      finalize(() => this.loadingMunicipalities = false)
    );*/
  }

  get type() {
    return this.form?.get('type')?.value;
  }

  ngOnInit(): void {
    this.initForm();
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    
    const value = this.form.value;
    this.form.disable();
    this.loaderService.show();
    if (this.type === 'LEGAL') {
      
    } else {
      delete value.reuup;
    }

    delete value.province;
    const solicitud = {
      tipo: 'seller',
      data: value,
    };

    const solicitud_data = new FormData();

    solicitud_data.append('tipo', 'seller');
    solicitud_data.append('data', JSON.stringify(value));


    this.solicitudService.create(solicitud_data)
      .pipe(
        catchError(err => {
          this.snackBar.open( 'Ocurrió un error al enviar la solicitud. Error:' + JSON.stringify(err.error));
          return throwError(err);
        }),
        finalize(() => {
          this.loaderService.hide();
          this.form.enable();
        })
      )
      .subscribe(() => {
        this.snackBar.open('Su solicitud ha sido enviada correctamente.');
        this.form.reset();
        this.router.navigateByUrl('/profile/following');
      });
  }

  selectProvince({ value }) {
    this.form.get('municipality').reset();
    this.loadingMunicipalities = true;
    this.municipalities$ = this.locationService
      .getMunicipalities({ province__id: value })
      .pipe(
        map(response => {
          this.form.get('municipality').enable();
          return response.results;
        }),
        catchError(err => {
          this.form.get('municipality').disable();

          throw err;
        }),
        finalize(() => (this.loadingMunicipalities = false))
      );
  }

  private initForm() {
    this.form = this.fb.group({
      ci: ['',[Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^\\d+$')]],
      type: ['NATURAL', [Validators.required]],
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required]],
      province: [null, [Validators.required]],
      codeType: ['REUUP', Validators.required],
      reuup: [{ value: '', disabled: true }, [Validators.required]],
      bank_branch: ['', [Validators.required, Validators.pattern('^\\d+$')]],
      bank_card: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern('^\\d+$')]],
      nit: [{ value: '', disabled: false }, [Validators.required]],
      license: ['', []],
      account: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern('^\\d+$')]],
      municipality: [{ value: null, disabled: true}, [Validators.required]],
      user: ['', []],
    });

    const data = this.data();
    if (data) {
      this.form.patchValue(data);
      this.loadingMunicipalities = true;
      this.locationService
        .getMunicipalities({ id: data.municipality })
        .subscribe(response => {
          this.form.get('municipality').enable();
          this.provinces$.subscribe(provinces => {
            const province = provinces.find(
              prov => prov.name === response.results[0].province
            );
            this.form.get('province').setValue(province.id);
            this.municipalities$ = this.locationService
              .getMunicipalities({ province__id: province.id })
              .pipe(
                map(res => res.results),
                finalize(() => (this.loadingMunicipalities = false))
              );
          });
        });
    }

    this.form.get('codeType').valueChanges.subscribe(value => { 
      if (value === 'NIT') { 
        this.enableControls(['nit']);
        this.disableControls(['reuup']);
      } else { 
        this.enableControls(['reuup']);
        this.disableControls(['nit']);
      } 
    });

    this.form.get('type').valueChanges.pipe(
        startWith(data?.type || 'NATURAL'),
        tap(type => {
          if (type === 'NATURAL') {
            this.enableControls(['license', 'nit', 'bank_card']);
            this.disableControls(['reuup']);
          } else {
            this.enableControls(['reuup']);
            //this.enableControls(['nit']);
            this.disableControls(['license', 'nit', 'bank_card']);
          }
        })
      )
      .subscribe();
  }

  private enableControls(controlKeys: string[]) {
    controlKeys.forEach(key => {
      this.form.controls[key].enable();
    });
  }

  private disableControls(controlKeys: string[]) {
    controlKeys.forEach(key => {
      this.form.controls[key].disable();
    });
  }
}
