import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {PlanetService} from '../planet.service';
import {Planet} from '../planet';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-planet-table-view',
  templateUrl: './planet-table-view.component.html',
  styleUrls: ['./planet-table-view.component.css']
})
export class PlanetTableViewComponent implements AfterViewInit, OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns = ['address', 'cost', 'currentUnits', 'currentOwner'];

  promise: Promise<MatTableDataSource<Planet>>;
  planets: MatTableDataSource<Planet>;
  constructor(private planetService: PlanetService) { }

  async ngOnInit(): Promise<void> {
   this.promise = this.planetService.getAllPlanets().then(value => value.toPromise()).then(value => new MatTableDataSource(value));
  }

  ngAfterViewInit(): void {
    this.promise.then(value => {
      this.planets = value;
      this.planets.sort = this.sort;
      this.planets.paginator = this.paginator;
    });
  }
}
