import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor } from '@angular/material/button';

@Component({
    selector: 'app-download-link',
    templateUrl: './download-link.component.html',
    styleUrls: ['./download-link.component.scss'],
    standalone: true,
    imports: [MatDialogContent, MatAnchor, MatDialogClose, MatIcon]
})
export class DownloadLinkComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<DownloadLinkComponent>>(MatDialogRef);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  ngOnInit() {
  }

}
