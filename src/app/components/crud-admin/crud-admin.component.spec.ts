import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAdminComponent } from './crud-admin.component';

describe('CrudAdminComponent', () => {
  let component: CrudAdminComponent;
  let fixture: ComponentFixture<CrudAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrudAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
