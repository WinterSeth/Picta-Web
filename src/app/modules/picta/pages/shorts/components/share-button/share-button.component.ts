import { Component, input, signal, inject } from '@angular/core';
import { ShareService } from '../../services/share.service';

@Component({
    selector: 'app-share-button',
    imports: [],
    templateUrl: './share-button.component.html',
    styleUrl: './share-button.component.scss'
})
export class ShareButtonComponent {
  private shareService = inject(ShareService);

  slugUrl = input.required<string>();
  title = input<string>('Short');

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  openShareDialog(): void {
    this.shareService.openShareDialog(this.slugUrl(), this.title());
  }
}

