import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';

@Component({
    selector: 'app-payment-details',
    templateUrl: './payment-details.component.html',
    styleUrls: ['./payment-details.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatDialogActions, MatButton, MatDialogClose, DatePipe]
})
export class PaymentDetailsComponent implements OnInit {
  dialogRef = inject<MatDialogRef<PaymentDetailsComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() { }

  ngOnInit() {
  }

}
