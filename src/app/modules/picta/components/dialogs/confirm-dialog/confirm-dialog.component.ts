import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions } from '@angular/material/dialog';
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox";
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';


@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    imports: [MatDialogTitle, MatCheckbox, MatDialogActions, MatButton, MatIcon, MatIconButton]
})
export class ConfirmDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

  changeStatus($event: MatCheckboxChange) {
    const { checked } = $event;
    localStorage.setItem('showUpdateDialog', (!checked).toString());
  }
}
