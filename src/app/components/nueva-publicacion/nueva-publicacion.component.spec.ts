import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaPublicacionComponent } from './nueva-publicacion.component';

describe('NuevaPublicacionComponent', () => {
  let component: NuevaPublicacionComponent;
  let fixture: ComponentFixture<NuevaPublicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuevaPublicacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaPublicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
