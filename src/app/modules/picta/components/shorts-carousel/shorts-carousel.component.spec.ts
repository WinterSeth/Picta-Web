import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortsCarouselComponent } from './shorts-carousel.component';

describe('ShortsCarouselComponent', () => {
  let component: ShortsCarouselComponent;
  let fixture: ComponentFixture<ShortsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortsCarouselComponent],
      rethrowApplicationErrors: false
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
