import { AfterViewInit, Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { PlanetService } from '../planet.service';
import { Planet } from '../planet';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-planet-table-view',
  templateUrl: './planet-table-view.component.html',
  styleUrls: ['./planet-table-view.component.css']
})

export class PlanetTableViewComponent implements AfterViewInit, OnInit {
  @Input() canOnlySelectOwn;
  @Input() canSelect;
  @Input() singleSelect;
  @Output() selectionChanged = new EventEmitter<SelectionChange<Planet>>();
  displayedColumns: string[];

  constructor(private planetService: PlanetService, private clipboard: Clipboard) { }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  planets: MatTableDataSource<Planet>;
  myPlanets: Planet[];
  selection: SelectionModel<Planet>;
  selectedOp: string;
  currentUnitFilter: string;
  search: string;

  async ngOnInit(): Promise<void> {
    this.selection = new SelectionModel<Planet>(!this.singleSelect, [], true);
    this.selection.changed.subscribe(this);
    this.displayedColumns = [... this.canSelect ? ['select'] : [], 'address', 'cost', 'currentUnits', 'productionRate', 'currentOwner'];
  }

  canSelectPlanet(planet: Planet): boolean {
    return planet.isPlayerOwned() || !this.canOnlySelectOwn;
  }

  next(value: SelectionChange<Planet>): void {
    this.selectionChanged.emit(value);
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
    return this.selection.selected;
  }

  getTotalUnits(): number {
    return this.planets?.filteredData.reduce((acc, planet) => acc + planet.getTotalUnits(), 0);
  }

  getTotalUnitProductionRate(): number {
    return this.planets?.filteredData.reduce((acc, planet) => acc + planet.unitProductionRate, 0);
  }

  toggleSelection(planet: Planet): void {
    if (this.canSelectPlanet(planet)) {
      this.selection.toggle(planet);
    }
  }

  applyFilter(): void {
    if (!this.planets) {
      return;
    }

    this.planets.filter = this.search?.trim();
  }

  copyToClipboard(text: string): void {
    this.clipboard.copy(text);
  }

  changeSelectAll(event: MatCheckboxChange): void {
    this.selection.clear();
    if (event.checked) {
      this.selection.select(...this.planets.filteredData.filter(this.canSelectPlanet));
    }
  }
}
