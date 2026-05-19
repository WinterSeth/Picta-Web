import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss'],
    standalone: true,
    imports: [NgStyle, MatButton]
})
export class ContextMenuComponent implements OnInit {
  @Input() x;
  @Input() y;
  @Output() onCopyCodeClick = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  copyEmbebedCode() {
    this.onCopyCodeClick.emit();


  }
}
