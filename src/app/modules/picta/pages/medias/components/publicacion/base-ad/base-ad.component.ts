import {Component, Input, OnInit} from '@angular/core';


@Component({
    selector: 'app-base-ad',
    templateUrl: './base-ad.component.html',
    styleUrls: ['./base-ad.component.scss'],
    standalone: true,
    imports: []
})
export class BaseAdComponent implements OnInit {
  @Input() ad: any;

  constructor() {
  }

  ngOnInit(): void {
  }

}
