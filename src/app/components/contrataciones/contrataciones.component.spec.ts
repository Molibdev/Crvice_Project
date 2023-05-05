import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratacionesComponent } from './contrataciones.component';

describe('ContratacionesComponent', () => {
  let component: ContratacionesComponent;
  let fixture: ComponentFixture<ContratacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
