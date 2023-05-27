import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTransferenciaComponent } from './data-transferencia.component';

describe('DataTransferenciaComponent', () => {
  let component: DataTransferenciaComponent;
  let fixture: ComponentFixture<DataTransferenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTransferenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTransferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
