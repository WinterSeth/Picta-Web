import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkStatusButtonComponent } from './network-status-button.component';

describe('NetworkStatusButtonComponent', () => {
  let component: NetworkStatusButtonComponent;
  let fixture: ComponentFixture<NetworkStatusButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkStatusButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NetworkStatusButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
