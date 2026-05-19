import { Component, OnInit, inject } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LocalstorageService} from "../../../../services/localstorage.service";
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-mobile-dialog',
    templateUrl: './mobile-dialog.component.html',
    styleUrls: ['./mobile-dialog.component.scss'],
    standalone: true,
    imports: [MatIcon, MatAnchor, MatButton]
})
export class MobileDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<MobileDialogComponent>>(MatDialogRef);
  private localStorage = inject(LocalstorageService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  ngOnInit(): void {
  }

  goOnWeb() {
    this.dialogRef.close();
    this.localStorage.setItem('shownModal', JSON.stringify(true));
  }
}
