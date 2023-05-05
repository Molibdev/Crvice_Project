import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespTrabajoComponent } from './resp-trabajo.component';

describe('RespTrabajoComponent', () => {
  let component: RespTrabajoComponent;
  let fixture: ComponentFixture<RespTrabajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RespTrabajoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
