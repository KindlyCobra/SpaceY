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

  private currentBlockNumber: number;

  constructor(ethereumService: EthereumService) {
    this.ethereumService = ethereumService;
    this.planetsSubject = new Subject();
  }

  onNewPlanets(): Observable<Planet[]> {
    return this.planetsSubject;
  }

  async initialize() {
    await this.ethereumService.connectToMetaMask();
    this.currentBlockNumber = await this.ethereumService.getProvider().getBlockNumber();
    await this.loadInitialPlanets();

    const contract = this.ethereumService.getContract();

    contract.on("PlanetConquered", (planetId, player, units) => {
      console.info("New planet was conquered");
      this.planets[planetId].conquer(player, units, this.currentBlockNumber);
      this.notifyPlanets();
    })
  }

  async loadInitialPlanets() {
    const contract = this.ethereumService.getContract();
    const numPlanets = await contract.universeSize();

    function randomNumber(min: number, max: number): number {
      return Math.floor((Math.random() * (max - min)) + min);
    }

    this.planets = new Array(numPlanets);
    console.info("Starting planet initialisation for " + numPlanets + " planets");

    let promises: Promise<any>[] = new Array(numPlanets);

    for (let i = 0; i <= numPlanets; i++) {
      console.info("Started initalisation for planet: " + numPlanets);
      promises[i] = contract.planets(i).then(result => {
        this.planets[i] = new Planet(i, numPlanets);
        if (result.owner !== EthereumService.NULL_ADDRESS) {
          this.planets[i].conquer(result.owner, result.units, result.conquerBlockNumber);
        }
        console.info("Updated planet: " + numPlanets);
      });
    };
    await Promise.all(promises);
    console.warn("All planets initialized");
    this.notifyPlanets();
  }

  private notifyPlanets() {
    this.planetsSubject.next(Array.from(this.planets));
  }

}
