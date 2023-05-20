import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestPublicacionesComponent } from './gest-publicaciones.component';

describe('GestPublicacionesComponent', () => {
  let component: GestPublicacionesComponent;
  let fixture: ComponentFixture<GestPublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestPublicacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestPublicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
