import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarTrabajoComponent } from './solicitar-trabajo.component';

describe('SolicitarTrabajoComponent', () => {
  let component: SolicitarTrabajoComponent;
  let fixture: ComponentFixture<SolicitarTrabajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitarTrabajoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
