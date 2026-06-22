import { TestBed } from '@angular/core/testing';

import { CommentsSheetService } from './comments-sheet.service';

describe('CommentsSheetService', () => {
  let service: CommentsSheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentsSheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
