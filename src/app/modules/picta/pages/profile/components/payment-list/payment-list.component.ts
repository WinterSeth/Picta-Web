import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-payment-list',
    templateUrl: './payment-list.component.html',
    styleUrls: ['./payment-list.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, MatDialogActions, MatButton, MatDialogClose, DatePipe]
})
export class PaymentListComponent implements OnInit {
  dialogRef = inject<MatDialogRef<PaymentListComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() { }

  ngOnInit() {
  }

}
