import {Component, OnInit} from '@angular/core';
import { MatLine } from '@angular/material/core';

import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDialogTitle, MatDialogClose, MatDialogContent } from '@angular/material/dialog';

@Component({
    selector: 'app-changelog-dialog',
    templateUrl: './changelog-dialog.component.html',
    styleUrls: ['./changelog-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogTitle, MatIconButton, MatDialogClose, MatIcon, MatDialogContent, MatList, MatListItem, MatLine]
})
export class ChangelogDialogComponent implements OnInit {
  changes = [
    {
      icon: 'update',
      text: 'Migrado a Angular 11.'
    },
    {
      icon: 'comment',
      text: 'Adicionado paginado a los comentarios.'
    },
    {
      icon: 'change_history',
      text: 'Adicionada pantalla de changelog.'
    },
  ];

  constructor() {
  }

  ngOnInit(): void {
  }

}
