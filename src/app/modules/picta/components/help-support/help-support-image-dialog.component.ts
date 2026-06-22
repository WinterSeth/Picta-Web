import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface HelpSupportImageDialogData {
  imageUrl: string;
  title?: string;
}

@Component({
  selector: 'app-help-support-image-dialog',
  standalone: true,
  templateUrl: './help-support-image-dialog.component.html',
  styleUrls: ['./help-support-image-dialog.component.scss'],
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule]
})
export class HelpSupportImageDialogComponent {
  data = inject<HelpSupportImageDialogData>(MAT_DIALOG_DATA);
}
