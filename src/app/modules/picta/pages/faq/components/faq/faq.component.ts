import { Component, OnInit, inject, input } from '@angular/core';
import { UtilsService } from '../../../../../../services/utils.service';
import { pluck } from 'rxjs';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatAccordion, MatExpansionModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss'],
    imports: [MatAccordion, MatExpansionModule, MatExpansionPanelHeader, MatExpansionPanelTitle, AsyncPipe]
})
export class FaqComponent implements OnInit {
  private utilService = inject(UtilsService);

  /** When false, the component skips its own header (use when embedded in a parent that provides one) */
  readonly showHeader = input<boolean>(true);

  qs: Observable<any>;

  constructor() {}

  ngOnInit() {
    this.qs = this.utilService.getFaqs().pipe(pluck('results'));
  }
}