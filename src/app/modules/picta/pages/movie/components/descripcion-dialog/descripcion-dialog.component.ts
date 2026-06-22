import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { modalScaleInAnimation } from '../../../../animations/dialogs';

export interface DescripcionDialogData {
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-descripcion-dialog',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="descripcion-dialog-title">
      <span>{{ data.titulo }}</span>
      <button
        mat-icon-button
        type="button"
        aria-label="Cerrar modal"
        class="descripcion-dialog-close"
        (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content class="descripcion-dialog-content">
      <p class="descripcion-dialog-text">{{ data.descripcion }}</p>
    </mat-dialog-content>
  `,
  animations: [modalScaleInAnimation],
  host: {
    '[@modalScaleIn]': '',
  }
})
export class DescripcionDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DescripcionDialogComponent>);
  readonly data = inject<DescripcionDialogData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}