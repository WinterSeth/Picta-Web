import {Component, Input, OnInit} from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';

@Component({
    selector: 'app-custom-button',
    templateUrl: './custom-button.component.html',
    styleUrls: ['./custom-button.component.scss'],
    standalone: true,
    imports: [MatAnchor, RouterLinkActive, RouterLink]
})
export class CustomButtonComponent implements OnInit {
  @Input() route: string[];
  @Input() value: string;
  active = false;

  constructor() {
  }

  ngOnInit() {
  }
}
