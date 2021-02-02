import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {

  constructor() { }

  async getAllPlanets(): Promise<Observable<Planet[]>> {
    return Promise.resolve(of([
      new Planet(1),
      new Planet(2)
    ]));
  }
}
