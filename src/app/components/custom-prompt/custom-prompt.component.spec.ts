import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPromptComponent } from './custom-prompt.component';

describe('CustomPromptComponent', () => {
  let component: CustomPromptComponent;
  let fixture: ComponentFixture<CustomPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomPromptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
