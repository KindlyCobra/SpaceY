import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleViewComponent } from './console-view.component';

describe('ConsoleViewComponent', () => {
  let component: ConsoleViewComponent;
  let fixture: ComponentFixture<ConsoleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsoleViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
