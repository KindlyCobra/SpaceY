import {AfterViewInit, Component, OnInit, Output, ViewChild, EventEmitter, Input} from '@angular/core';
import {PlanetService} from '../planet.service';
import {Planet} from '../planet';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatCheckboxChange} from '@angular/material/checkbox';

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

  constructor(private planetService: PlanetService) {}

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  promise: Promise<MatTableDataSource<Planet>>;
  planets: MatTableDataSource<Planet>;
  myPlanets: Planet[];
  selection: number[] = [];

  async ngOnInit(): Promise<void> {
    this.promise = this.planetService.getAllPlanets().then(value => value.toPromise()).then(value => new MatTableDataSource(value));
    this.displayedColumns = [... this.canSelect ? ['select'] : [], 'address', 'cost', 'currentUnits', 'currentOwner'];
  }

  ngAfterViewInit(): void {
    this.promise.then(value => {
      this.planets = value;
      this.planets.sort = this.sort;
      this.planets.paginator = this.paginator;
      this.planets.filterPredicate = Planet.filterPredicate;
      this.myPlanets = this.planets.data.filter(planet => planet.ownedBy === 1);
    });
  }

  getSelected(): Planet[] {
    return this.selection?.map(address => this.planets.data.find(planet => planet.address === address));
  }

  getTotalOwnedUnits(): number {
    return this.myPlanets?.reduce((acc, planet) => acc + planet.currentUnits, 0);
  }

  applyFilter(event: KeyboardEvent): void {
    if (!this.planets || event.key !== 'Enter') {
      return;
    }

    this.planets.filter = (event.target as HTMLInputElement).value.toLowerCase().trim();
  }

  changeSelectAll(change: MatCheckboxChange): void {
    if (change.checked) {
      this.selection = this.planets.filteredData.map(planet => planet.address);
    } else {
      this.selection = [];
    }

    this.selectionChanged.emit(this.getSelected());
  }

  changeSelectOne(planet: Planet, change: MatCheckboxChange): void {
    if (change.checked) {
      this.selection.push(planet.address);
    } else {
      this.selection = this.selection.filter(address => address !== planet.address);
    }

    this.selectionChanged.emit(this.getSelected());
  }
}
