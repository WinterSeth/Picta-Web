import { Component, OnInit, input, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-profile-confirm-change-pswd-modal',
    templateUrl: './profile-confirm-change-pswd-modal.component.html',
    styleUrls: ['./profile-confirm-change-pswd-modal.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton]
})
export class ProfileConfirmChangePswdModalComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ProfileConfirmChangePswdModalComponent>>(MatDialogRef);

  readonly user = input(undefined);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }


}
