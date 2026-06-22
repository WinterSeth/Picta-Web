import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChild, faDownload, faMobileAlt, faRadio, faTv } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-reason-dialog',
    imports: [FontAwesomeModule, NgClass, MatButtonModule, MatIconModule, MatDialogModule],
    templateUrl: './reason-dialog.component.html',
    styleUrl: './reason-dialog.component.scss'
})
export class ReasonDialogComponent {
  reason = inject(MAT_DIALOG_DATA);
  private readonly _library = inject(FaIconLibrary);

  constructor() {
    this._library.addIcons(faTv, faDownload, faMobileAlt, faChild, faRadio);
  }
}