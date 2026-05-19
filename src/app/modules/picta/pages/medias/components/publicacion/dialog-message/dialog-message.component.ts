import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-message',
    templateUrl: './dialog-message.component.html',
    styleUrls: ['./dialog-message.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose]
})
export class DialogMessageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
