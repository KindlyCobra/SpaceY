import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetTableViewComponent } from './planet-table-view.component';

describe('PlanetListViewComponent', () => {
  let component: PlanetTableViewComponent;
  let fixture: ComponentFixture<PlanetTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanetTableViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanetTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
