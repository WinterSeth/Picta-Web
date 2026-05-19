import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonsToJoinSectionComponent } from './reasons-to-join-section.component';

describe('ReasonsToJoinSectionComponent', () => {
  let component: ReasonsToJoinSectionComponent;
  let fixture: ComponentFixture<ReasonsToJoinSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReasonsToJoinSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReasonsToJoinSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
