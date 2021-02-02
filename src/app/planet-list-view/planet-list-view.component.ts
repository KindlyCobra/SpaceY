import { Component, OnInit } from '@angular/core';
import {PlanetService} from '../planet.service';
import {Observable} from 'rxjs';
import {Planet} from '../planet';

@Component({
  selector: 'app-planet-list-view',
  templateUrl: './planet-list-view.component.html',
  styleUrls: ['./planet-list-view.component.css']
})
export class PlanetListViewComponent implements OnInit {

  planets: Observable<Planet[]>;
  constructor(private planetService: PlanetService) { }

  async ngOnInit(): Promise<void> {
    this.planets = await this.planetService.getAllPlanets();
  }
}
