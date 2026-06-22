import { Component, OnDestroy, OnInit, input, output, inject } from '@angular/core';
import {DenunciaService} from '../../../services/denuncia.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {SubSink} from 'subsink';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PictaResponse} from '../../../../../models/response.picta.model';
import { MatButton } from '@angular/material/button';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';

const allowedFileTypes = [
  'txt',
  'pdf',
  'doc',
  'docm',
  'docx',
  'odt',
  'png',
  'jpg',
]
@Component({
    selector: 'app-denuncia-form',
    templateUrl: './denuncia-form.component.html',
    styleUrls: ['./denuncia-form.component.scss'],
    imports: [ReactiveFormsModule, MatRadioGroup, MatRadioButton, MatButton]
})
export class DenunciaFormComponent implements OnInit, OnDestroy {
  private denunciaService = inject(DenunciaService);
  private fb = inject(UntypedFormBuilder);
  private snackBar = inject(MatSnackBar);

  denunciaForm: UntypedFormGroup;
  denunciaState: number;
  readonly video = input(undefined);
  readonly denuncia = output();
  tiposDenuncia: any[] = [];
  loadingTiposDenuncia = true;
  subs = new SubSink();
  evidenciaName = 'Adjuntar documento o foto';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
    this.denunciaForm = this.fb.group({
      tipo_denuncia: ['', Validators.required],
      evidencia: [null, []]
    });
  }

  ngOnInit() {
    this.subs.add(
      this.denunciaService.getTipos().pipe(finalize(() => {
        this.loadingTiposDenuncia = false;
      })).subscribe({
        next: (data: PictaResponse<any>) => {
          this.tiposDenuncia = data.results ?? [];
        },
        error: () => {
          this.tiposDenuncia = [];
        }
      })
    );

  }

  denunciar() {
    this.subs.add(
      this.denunciaService.add(this.denunciaForm.value, this.video().id).subscribe(res => {
        this.snackBar.open('Su denuncia ha sido enviada correctamente.');
        this.denunciaForm.reset();
        this.denuncia.emit();
      }, error1 => {
        if (error1.status === 400) {
          this.snackBar.open('Ya ha denunciado este video.');
        }

      })
    );

  }
  public blobToFile = (theBlob: Blob, fileName: string): File => {
    return new File([theBlob], fileName, {type: theBlob.type, lastModified: Date.now()});
  };
  ngOnDestroy(): void {
    this.subs.unsubscribe();

  }

  handleFileChange(evt: any) {
    const blob = evt.target.files[0];
    const arr = blob.name.split('.');
    const ext = arr[arr.length-1];
    const evidencia = this.blobToFile(blob, `${blob.name}`);
    if (!allowedFileTypes.includes(ext)){
      this.snackBar.open('Sólo se permiten archivos en formato .txt, .pdf, .doc, .docm, .docx, .odt, .png, .jpg');
      return;
    }
    const fr = new FileReader();
    this.evidenciaName = evidencia.name;
    fr.readAsDataURL(evidencia);
    fr.onload = () => {
      this.denunciaForm.patchValue({evidencia});
    };
  }

  tipoDenunciaChanged({value}) {
    if (value === 1){
      this.denunciaForm.get('evidencia').setValidators([Validators.required])
      this.denunciaForm.get('evidencia').enable();
    } else {
      this.denunciaForm.get('evidencia').setValidators([]);
      this.denunciaForm.get('evidencia').disable();
    }
  }
}
