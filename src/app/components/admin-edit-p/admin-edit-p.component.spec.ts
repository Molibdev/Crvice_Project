import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditPComponent } from './admin-edit-p.component';

describe('AdminEditPComponent', () => {
  let component: AdminEditPComponent;
  let fixture: ComponentFixture<AdminEditPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminEditPComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
