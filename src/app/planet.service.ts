import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { Planet } from './planet';
import { EthereumService } from './ethereum.service';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {

  private ethereumService: EthereumService;

  private planets: Planet[];
  private planetsSubject: Subject<Planet[]>;

  constructor(ethereumService: EthereumService) {
    this.ethereumService = ethereumService;
    this.planetsSubject = new Subject();
  }

  onNewPlanets(): Observable<Planet[]> {
    return this.planetsSubject;
  }

  async loadInitialPlanets() {
    await this.ethereumService.connectToMetaMask();
    const numPlanets = await this.ethereumService.getContract().universeSize();

    function randomNumber(min: number, max: number): number {
      return Math.floor((Math.random() * (max - min)) + min);
    }

    this.planets = new Array(numPlanets);

    for (var i = 0; i <= numPlanets; i++) {
      const isOwned = Math.random() < 0.5;
      this.planets[i] = new Planet(i, isOwned ? randomNumber(1, 10) : 0, isOwned ? randomNumber(0, 100) : 0, numPlanets);
    };

    this.planetsSubject.next(this.planets);
  }

}
