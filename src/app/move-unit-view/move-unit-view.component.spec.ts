import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveUnitViewComponent } from './move-unit-view.component';

describe('MoveUnitViewComponent', () => {
  let component: MoveUnitViewComponent;
  let fixture: ComponentFixture<MoveUnitViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveUnitViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveUnitViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
