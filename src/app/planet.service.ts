import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Planet} from './planet';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {

  constructor() {
  }

  async getAllPlanets(): Promise<Observable<Planet[]>> {
    const min = 0;
    const max = Number.MAX_SAFE_INTEGER;
    const numPlanets = 10000;

    const planets = Array.from(new Array(numPlanets), () => new Planet(Math.floor((Math.random() * (max - min)) + min)));
    return Promise.resolve(of(planets));
  }
}
