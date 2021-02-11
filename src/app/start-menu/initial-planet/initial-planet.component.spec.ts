import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialPlanetComponent } from './initial-planet.component';

describe('InitialPlanetComponent', () => {
  let component: InitialPlanetComponent;
  let fixture: ComponentFixture<InitialPlanetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitialPlanetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialPlanetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
