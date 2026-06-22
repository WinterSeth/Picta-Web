import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-movie-dialog-component',
    imports: [MatIconModule, MatDialogModule, MatButtonModule, RouterLink],
    templateUrl: './movie-dialog-component.component.html',
    styleUrl: './movie-dialog-component.component.scss'
})
export class MovieDialogComponentComponent {
  data = inject(MAT_DIALOG_DATA);

  constructor() {}
}