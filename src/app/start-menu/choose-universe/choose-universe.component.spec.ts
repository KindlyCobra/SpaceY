import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseUniverseComponent } from './choose-universe.component';

describe('ChooseUniverse', () => {
  let component: ChooseUniverseComponent;
  let fixture: ComponentFixture<ChooseUniverseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChooseUniverseComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseUniverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
