import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortComponent } from './short.component';

describe('ShortComponent', () => {
  let component: ShortComponent;
  let fixture: ComponentFixture<ShortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortComponent],
      rethrowApplicationErrors: false
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
