import { AfterViewInit, Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { PlanetService } from '../planet.service';
import { Planet } from '../planet';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-planet-table-view',
  templateUrl: './planet-table-view.component.html',
  styleUrls: ['./planet-table-view.component.css']
})

export class PlanetTableViewComponent implements AfterViewInit, OnInit {
  @Input() canSelectEnemyPlanets;
  @Input() canSelect;
  @Output() selectionChanged = new EventEmitter<Planet[]>();
  displayedColumns: string[];

  constructor(private planetService: PlanetService) { }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  planets: MatTableDataSource<Planet>;
  myPlanets: Planet[];
  selection: number[] = [];
  selectedOp: string;
  currentUnitFilter: string;
  search: string;

  async ngOnInit(): Promise<void> {
    this.displayedColumns = [... this.canSelect ? ['select'] : [], 'address', 'cost', 'currentUnits', 'productionRate', 'currentOwner'];
  }

  ngAfterViewInit(): void {
    if (this.planetService.planetCache) {
      this.updateTableData(this.planetService.planetCache);
    }

    this.planetService.onNewPlanets().subscribe({
      next: value => this.updateTableData(value)
    });
  }

  private updateTableData(value: Planet[]): void {
      this.planets = new MatTableDataSource(value);
      this.planets.sort = this.sort;
      this.planets.paginator = this.paginator;
      this.planets.filterPredicate = Planet.filterPredicate;
      this.myPlanets = this.planets.data.filter(planet => planet.owner === '0x1');
      this.applyFilter();
  }

  getSelected(): Planet[] {
    return this.planets.data.filter(planet => this.selection?.includes(planet.id));
  }

  getTotalOwnedUnits(): number {
    return this.myPlanets?.reduce((acc, planet) => acc + planet.getTotalUnits(), 0);
  }

  getTotalUnitProductionRate(): number {
    return this.planets?.filteredData.reduce((acc, planet) => acc + planet.unitProductionRate, 0);
  }

  applyFilter(): void {
    if (!this.planets) {
      return;
    }

    this.planets.filter = this.search?.trim();
  }

  changeSelectAll(change: MatCheckboxChange): void {
    if (change.checked) {
      this.selection = this.planets.filteredData.map(planet => planet.id);
    } else {
      this.selection = [];
    }

    this.selectionChanged.emit(this.getSelected());
  }

  changeSelectOne(planet: Planet, change: MatCheckboxChange): void {
    if (change.checked) {
      this.selection.push(planet.id);
    } else {
      this.selection = this.selection.filter(id => id !== planet.id);
    }

    this.selectionChanged.emit(this.getSelected());
  }
}
