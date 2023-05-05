import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespSolicitudComponent } from './resp-solicitud.component';

describe('RespSolicitudComponent', () => {
  let component: RespSolicitudComponent;
  let fixture: ComponentFixture<RespSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RespSolicitudComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
