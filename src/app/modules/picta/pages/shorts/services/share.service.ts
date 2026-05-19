import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialogComponent, ShareDialogData } from '../components/share-dialog/share-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
    private dialog = inject(MatDialog);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);


    constructor() {}

  openShareDialog(slugUrl: string, title: string = 'Short'): void {
    this.dialog.open(ShareDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: { slugUrl, title } as ShareDialogData,
      panelClass: 'share-dialog-container'
    });
  }
}
