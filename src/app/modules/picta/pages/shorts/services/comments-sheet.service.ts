import { Injectable, inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CommentsSheetComponent } from '../components/comments-sheet/comments-sheet.component';

export interface CommentsSheetData {
  shortId: string;
  userId: string;
  shortTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsSheetService {
  private bottomSheet = inject(MatBottomSheet);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {}

  openCommentsSheet(video: any, user: any): void {
    this.bottomSheet.open(CommentsSheetComponent, {
      data: {video, user},
      panelClass: 'comments-bottom-sheet'
    });
  }
}
