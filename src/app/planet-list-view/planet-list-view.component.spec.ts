import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetListViewComponent } from './planet-list-view.component';

describe('PlanetListViewComponent', () => {
  let component: PlanetListViewComponent;
  let fixture: ComponentFixture<PlanetListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanetListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanetListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
