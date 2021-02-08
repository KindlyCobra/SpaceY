import { Injectable } from '@angular/core';
import { from, Observable, Observer, Subject } from 'rxjs';
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
    this.isActivePlayer();
    await this.loadInitialPlanets();
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    const contract = this.ethereumService.getContract();
    const provider = this.ethereumService.getProvider();

    provider.on("block", (blockNumber) => {
      console.info("Received block " + blockNumber);
      this.currentBlockNumber = blockNumber;
      this.updateDynamicUnits();
      this.notifyPlanets();
    })

    contract.on("PlanetConquered", (planetId, player, units) => {
      console.info(`Player ${player} conquered planet ${planetId}`);
      this.planets[planetId].conquer(player, units, this.currentBlockNumber);
    });

    contract.on("UnitsMoved", (fromPlanetId, toPlanetId, player, units) => {
      console.info(`Player ${player} moved ${units} units from planet ${fromPlanetId} to ${toPlanetId}`);
      this.planets[fromPlanetId].moveUnits(-units);
      this.planets[toPlanetId].moveUnits(units);
    });
  }

  private async loadInitialPlanets() {
    const contract = this.ethereumService.getContract();
    const numPlanets = await contract.universeSize();

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

  private async isActivePlayer() {
    const contract = this.ethereumService.getContract();

    let result = await contract.playerStartBlocks(this.ethereumService.getPlayerAddress());
    if (result.toNumber() == 0) {
      console.warn("Player is not active in this universum!")
    } else {
      console.info("Player is active in this universum")
    }
  }

  private updateDynamicUnits() {
    this.planets.forEach(planet => {
      planet.updateDynamicUnits(this.currentBlockNumber);
    });
  }

  private notifyPlanets() {
    console.info("Updating planets");
    this.planetsSubject.next(Array.from(this.planets));
  }

}
