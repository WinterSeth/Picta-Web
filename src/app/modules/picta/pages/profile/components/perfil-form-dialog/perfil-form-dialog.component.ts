import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

export interface PerfilFormData {
  nombre: string;
  tipo: 'ADULTO' | 'INFANTIL';
}

@Component({
  selector: 'app-perfil-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatIconModule,
  ],
  templateUrl: './perfil-form-dialog.component.html',
  styleUrls: ['./perfil-form-dialog.component.scss']
})
export class PerfilFormDialogComponent implements OnChanges {
  @Output() submitted = new EventEmitter<PerfilFormData>();
  @Output() cancelled = new EventEmitter<void>();
  
  // Leer initial desde dialog data
  private data = inject(MAT_DIALOG_DATA);
  initial = this.data?.initial ?? null;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PerfilFormDialogComponent>);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    tipo: ['ADULTO' as const, Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initial'] && this.initial) {
      this.form.patchValue({
        nombre: this.initial.nombre || '',
        tipo: this.initial.tipo || 'ADULTO'
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitted.emit(this.form.value as PerfilFormData);
    this.dialogRef.close(this.form.value);
  }

  onCancel(): void {
    this.cancelled.emit();
    this.dialogRef.close();
  }
}
