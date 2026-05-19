import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-terms-dialog',
    templateUrl: './terms-dialog.component.html',
    styleUrls: ['./terms-dialog.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton]
})
export class TermsDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<TermsDialogComponent>>(MatDialogRef);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  ngOnInit() {
  }

}
