import { Component, input, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header 
      class="categoria-header rounded-xl mt-2"
      [ngClass]="{'has-bg': !!image(), 'needs-dark-overlay': needsDarkOverlay}"
      [style.--header-bg-image]="image() ? 'url(' + image() + ')' : ''"
      role="region"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="description() ? descId : null">
      <div class="categoria-header__overlay" [class.overlay-dark]="needsDarkOverlay" aria-hidden="true"></div>
      <div class="categoria-header__content">
        <h1 class="categoria-header__title" [id]="titleId">{{ title() }}</h1>
        @if (description()) {
          <p class="categoria-header__description" [id]="descId">{{ description() }}</p>
        }
      </div>
    </header>
  `,
  styleUrls: ['./section-header.component.scss'],
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly image = input<string>('/img/section_header.webp');

  // runtime hint used to toggle a dark overlay when the background image is bright
  needsDarkOverlay = false;

  // Unique IDs for accessibility (stable per component instance)
  readonly titleId = `section-header-title-${Math.random().toString(36).slice(2,8)}`;
  readonly descId = `section-header-desc-${Math.random().toString(36).slice(2,8)}`;

  ngAfterViewInit(): void {
    const src = this.image?.();
    if (src) this.checkImageBrightness(src);
  }

  private checkImageBrightness(src: string) {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;
      img.onload = () => {
        const w = 32;
        const h = 32;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // approximate luminance (sRGB)
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          total += lum;
        }
        const avg = total / (w * h);
        // threshold: if average luminance is high, background is light -> use dark overlay
        this.needsDarkOverlay = avg > 150;
        // cleanup
        canvas.remove();
      };
      img.onerror = () => { /* ignore, keep default */ };
    } catch (e) {
      // silent fail — don't block rendering
    }
  }
}