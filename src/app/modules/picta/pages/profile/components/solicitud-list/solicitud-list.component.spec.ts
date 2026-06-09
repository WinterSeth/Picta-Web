import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudListComponent } from './solicitud-list.component';

describe('SolicitudListComponent', () => {
  let component: SolicitudListComponent;
  let fixture: ComponentFixture<SolicitudListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SolicitudListComponent],
    rethrowApplicationErrors: false
})
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
