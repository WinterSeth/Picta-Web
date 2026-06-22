import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ConfirmLastPlayedTimeComponent} from './confirm-last-played-time.component';

describe('ConfirmLastPlayedTimeComponent', () => {
  let component: ConfirmLastPlayedTimeComponent;
  let fixture: ComponentFixture<ConfirmLastPlayedTimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ConfirmLastPlayedTimeComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmLastPlayedTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
