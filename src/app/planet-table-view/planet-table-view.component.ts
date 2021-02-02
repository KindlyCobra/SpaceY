import { Component, OnInit } from '@angular/core';
import {PlanetService} from '../planet.service';
import {Observable} from 'rxjs';
import {Planet} from '../planet';

@Component({
  selector: 'app-planet-table-view',
  templateUrl: './planet-table-view.component.html',
  styleUrls: ['./planet-table-view.component.css']
})
export class PlanetTableViewComponent implements OnInit {

  displayedColumns = ['address', 'cost', 'currentUnits', 'currentOwner'];

  planets: Observable<Planet[]>;
  constructor(private planetService: PlanetService) { }

  async ngOnInit(): Promise<void> {
    this.planets = await this.planetService.getAllPlanets();
    this.planets.subscribe(console.log);
  }
}
