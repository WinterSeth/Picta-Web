import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsSheetComponent } from './comments-sheet.component';

describe('CommentsSheetComponent', () => {
  let component: CommentsSheetComponent;
  let fixture: ComponentFixture<CommentsSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsSheetComponent],
      rethrowApplicationErrors: false
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
