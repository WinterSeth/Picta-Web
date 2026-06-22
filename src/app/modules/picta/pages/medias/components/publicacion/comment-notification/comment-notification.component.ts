import { Component, OnInit, inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-comment-notification',
    templateUrl: './comment-notification.component.html',
    styleUrls: ['./comment-notification.component.scss'],
    imports: [NgOptimizedImage]
})
export class CommentNotificationComponent implements OnInit {
  data = inject(MAT_SNACK_BAR_DATA);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  ngOnInit() {
  }

}
