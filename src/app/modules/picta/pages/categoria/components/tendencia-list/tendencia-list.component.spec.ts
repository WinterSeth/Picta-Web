import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TendenciaListComponent } from './tendencia-list.component';

describe('TendenciaListComponent', () => {
  let component: TendenciaListComponent;
  let fixture: ComponentFixture<TendenciaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TendenciaListComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(TendenciaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
