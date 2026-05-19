import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvivoListComponent } from './envivo-list.component';

describe('EnvivoListComponent', () => {
  let component: EnvivoListComponent;
  let fixture: ComponentFixture<EnvivoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EnvivoListComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(EnvivoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
