import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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

  private initialized: boolean = false;

  constructor(ethereumService: EthereumService) {
    this.ethereumService = ethereumService;
    this.planetsSubject = new Subject();
  }

  onNewPlanets(): Observable<Planet[]> {
    return this.planetsSubject;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    await this.ethereumService.connectToMetaMask();
    Planet.ethereumSerivce = this.ethereumService;
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
      let planet = this.planets[planetId];
      this.syncRealPlanetStats(planet);
      planet.conquer(player, units.toNumber(), this.currentBlockNumber);
      this.fetchAndPrintSyncDrift(planetId);
    });

    contract.on("UnitsSendToConquer", (fromPlanetId, toPlanetId, player, units) => {
      let fromPlanet = this.planets[fromPlanetId];
      console.info(`Player ${player} sended ${units} units from planet ${fromPlanet.renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()} to conquer it`);
      fromPlanet.moveUnits(-units.toNumber());
      this.fetchAndPrintSyncDrift(fromPlanetId);
    });

    contract.on("UnitsMoved", (fromPlanetId, toPlanetId, player, units) => {
      console.info(`Player ${player} moved ${units} units from planet ${this.planets[fromPlanetId].renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()}`);
      this.planets[fromPlanetId].moveUnits(-units.toNumber());
      this.planets[toPlanetId].moveUnits(units.toNumber());
      this.fetchAndPrintSyncDrift(fromPlanetId);
      this.fetchAndPrintSyncDrift(toPlanetId);
    });
  }

  private async loadInitialPlanets() {
    const contract = this.ethereumService.getContract();
    const numPlanets = await contract.universeSize();

    this.planets = new Array(numPlanets);
    console.info('Starting planet initialisation for ' + numPlanets + ' planets');

    const promises: Promise<any>[] = new Array(numPlanets);

    for (let i = 0; i <= numPlanets; i++) {
      promises[i] = contract.getPlanet(i).then(async result => {
        let planet = new Planet(i, numPlanets);
        if (result.owner === this.ethereumService.getPlayerAddress()) {
          await this.syncRealPlanetStats(planet);
        }
        if (result.owner !== EthereumService.NULL_ADDRESS) {
          planet.conquer(result.owner, result.units.toNumber(), result.conquerBlockNumber);
        }
        planet.updateDynamicUnits(this.currentBlockNumber);
        this.planets[i] = planet;
      });
    }
    await Promise.all(promises);
    console.warn("All planets initialized");

    this.notifyPlanets();
  }

  private async syncRealPlanetStats(planet: Planet) {
    if (!planet.isSynced) {
      let realStats = await this.ethereumService.getContract().getPlanetStats(planet.id);
      console.info(`Synced real values for planet ${planet.renderPlanetId()}`);
      planet.syncRealStats(realStats.unitsCost.toNumber(), realStats.unitsCreationRate.toNumber());
    }
  }

  private async fetchAndPrintSyncDrift(planetId: number) {
    let result = await this.ethereumService.getContract().getUnitsOnPlanet(planetId);
    let planet = this.planets[planetId];
    console.info(`Received planet update for ${planet.renderPlanetId()}, is: ${planet.getTotalUnits()} should: ${result.toNumber()}`);
  }

  private async isActivePlayer() {
    const contract = this.ethereumService.getContract();

    let result = await contract.startPlanets(this.ethereumService.getPlayerAddress());
    if (result.conquerBlockNumber.toNumber() == 0) {
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
