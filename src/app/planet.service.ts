import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Planet} from './planet';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {

  constructor() {}

  async moveUnits(): Promise<void> {
    return Promise.resolve();
  }

  async getAllPlanets(): Promise<Observable<Planet[]>> {
    const numPlanets = 10000;

    function randomNumber(min: number, max: number): number {
      return Math.floor((Math.random() * (max - min)) + min);
    }

    const planets = Array.from(new Array(numPlanets), () => {
      const isOwned = Math.random() < 0.5;
      return new Planet(randomNumber(0, numPlanets), isOwned  ? randomNumber(1, 10) : 0, isOwned ? randomNumber(0, 100) : 0);
    });
    return Promise.resolve(of(planets));
  }

}
