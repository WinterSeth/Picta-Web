import { Component, inject } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FaqComponent } from "../../../pages/faq/components/faq/faq.component";

@Component({
    selector: 'app-faq-section',
    imports: [FontAwesomeModule, FaqComponent],
    template: `
    <section class="faq-landing-section">
      <div class="max-w-screen-xl mx-auto">
        <app-faq [showHeader]="false"></app-faq>
      </div>
    </section>
  `,
    styles: [`
      :host {
        display: block;
        color: #f4f7fb;
        --picta-yellow: #f3e628;
        --picta-yellow-soft: rgba(243, 230, 40, 0.16);
        --picta-yellow-softer: rgba(243, 230, 40, 0.08);
        --picta-yellow-border: rgba(243, 230, 40, 0.28);
        --picta-text-muted: rgba(244, 247, 251, 0.6);
        --picta-accent: #e8462e;
      }

      .faq-landing-section {
        padding: 48px 16px;
        background: #05071f;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      @media (max-width: 600px) {
        .faq-landing-section {
          padding: 28px 8px;
        }
      }
    `]
})
export class FaqSectionComponent {
  private readonly _library = inject(FaIconLibrary);

  faPlus = faPlus;
  faMinus = faMinus;

  constructor() {
    this._library.addIcons(faPlus, faMinus);
  }
}