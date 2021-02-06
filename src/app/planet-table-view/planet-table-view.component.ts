import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { PlanetService } from '../planet.service';
import { Planet } from '../planet';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-planet-table-view',
  templateUrl: './planet-table-view.component.html',
  styleUrls: ['./planet-table-view.component.css']
})

export class PlanetTableViewComponent implements AfterViewInit, OnInit {

  constructor(private planetService: PlanetService) {
  }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns = ['address', 'cost', 'currentUnits', 'currentOwner'];

  promise: Promise<MatTableDataSource<Planet>>;
  planets: MatTableDataSource<Planet>;
  myPlanets: Planet[];
  players: Set<number>;

  async ngOnInit(): Promise<void> {
    this.planetService.onNewPlanets().subscribe({
      next: value => {
        this.planets = new MatTableDataSource(value);
        this.planets.sort = this.sort;
        this.planets.paginator = this.paginator;
        this.players = this.planets.data.reduce((acc, planet) => acc.add(planet.ownedBy), new Set<number>());
        this.planets.filterPredicate = Planet.filterPredicate;
        this.myPlanets = this.planets.data.filter(planet => planet.ownedBy === 1);
      }
    });
    await this.planetService.loadInitialPlanets();
  }

  ngAfterViewInit(): void {
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
}
