import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appModal]',
  standalone: true
})
export class ModalDirective {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('click')
  toggleModal(): void {
    const modal = this.el.nativeElement.querySelector('.modal');
    if (modal) {
      const isVisible = modal.classList.contains('hidden');
      if (isVisible) {
        this.renderer.removeClass(modal, 'hidden');
        modal.focus();
      } else {
        this.renderer.addClass(modal, 'hidden');
      }
    }
  }
}
