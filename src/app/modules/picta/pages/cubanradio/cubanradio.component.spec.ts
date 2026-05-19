import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CubanradioComponent } from './cubanradio.component';

describe('CubanradioComponent', () => {
  let component: CubanradioComponent;
  let fixture: ComponentFixture<CubanradioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CubanradioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CubanradioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
