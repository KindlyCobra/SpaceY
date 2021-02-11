import { Injectable } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { Planet } from './planet';
import { EthereumService } from './ethereum.service';
import { ConsoleService, Event } from './console.service';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {
  private planets: Planet[];
  private planetsSubject: Subject<Planet[]>;

  private currentBlockNumber: number;

  private initialized = false;

  public totalUnits: number = 0;
  public totalProductionRate: number = 0;

  constructor(private ethereumService: EthereumService, private consoleService: ConsoleService) {
    this.planetsSubject = new Subject();
  }

  onNewPlanets(): Observable<Planet[]> {
    return this.planetsSubject;
  }

  private async updateTotalStats() {
    const player = this.ethereumService.getPlayerAddress();
    this.totalUnits = 0;
    this.totalProductionRate = 0;
    this.planets.filter(planet => planet.owner == player).forEach(planet => {
      this.totalUnits += planet.getTotalUnits();
      this.totalProductionRate += planet.unitProductionRate
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (!this.ethereumService.isInitialized()) {
      return;
    }
    this.initialized = true;
    Planet.ethereumService = this.ethereumService;
    this.currentBlockNumber = await this.ethereumService.getProvider().getBlockNumber();
    await this.loadInitialPlanets();
    this.subscribeToEvents();
  }

  get planetCache(): Planet[] {
    return this.planets;
  }

  private async subscribeToEvents(): Promise<void> {
    const contract = this.ethereumService.getContract();
    const provider = this.ethereumService.getProvider();

    provider.on('block', (blockNumber) => {
      console.info('Received block ' + blockNumber);
      this.currentBlockNumber = blockNumber;
      this.updateDynamicUnits();
      this.updateTotalStats();
      this.notifyPlanets();
    });

    contract.on('PlanetConquered', (planetId, player, units) => {
      const planet = this.planets[planetId];
      this.syncRealPlanetStats(planet);
      planet.conquer(player, units.toNumber(), this.currentBlockNumber);
      if (planet.isPlayerOwned()) {
        this.consoleService.addEntry(`You conquered planet ${planet.renderPlanetId()}`, Event.Success);
      } else {
        this.consoleService.addEntry(`Enemy ${planet.renderOwnershipShort()} conquered planet ${planet.renderPlanetId()}`);
      }
    });

    contract.on('UnitsSendToConquer', (fromPlanetId, toPlanetId, player, units) => {
      const fromPlanet = this.planets[fromPlanetId];
      console.info(`Player ${player} sended ${units} units from planet ${fromPlanet.renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()} to conquer it`);
      fromPlanet.moveUnits(-units.toNumber());
    });

    contract.on('UnitsMoved', (fromPlanetId, toPlanetId, player, units) => {
      console.info(`Player ${player} moved ${units} units from planet ${this.planets[fromPlanetId].renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()}`);
      this.planets[fromPlanetId].moveUnits(-units.toNumber());
      this.planets[toPlanetId].moveUnits(units.toNumber());
      let fromPlanet = this.planets[fromPlanetId];
      if (fromPlanet.isPlayerOwned()) {
        this.consoleService.addEntry(`You moved ${units} units from planet ${fromPlanet.renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()}`, Event.Success);
      } else {
        this.consoleService.addEntry(`Enemy ${fromPlanet.renderOwnershipShort()} moved ${units} units from planet ${fromPlanet.renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()}`);
      }
    });
  }

  private async loadInitialPlanets(): Promise<void> {
    const contract = this.ethereumService.getContract();
    const numPlanets = await contract.universeSize();

    this.planets = new Array(numPlanets);
    console.info('Starting planet initialisation for ' + numPlanets + ' planets');
    this.consoleService.addEntry('Starting planet initialisation for ' + numPlanets + ' planets');

    for (let i = 0; i <= numPlanets; i++) {
      const planet = new Planet(i, numPlanets);
      this.planets[i] = planet;
    }

    let conqueredPlanets: Array<number> = await contract.getConqueredPlanets();
    let promises = conqueredPlanets.map(planetId => this.syncInitialPlanetData(planetId));
    promises.push(this.syncInitialPlanetData(numPlanets));

    await Promise.all(promises);
    console.warn('All planets initialized');
    this.consoleService.addEntry('All planets initialized');
    this.notifyPlanets();
  }

  private async syncInitialPlanetData(planetId: number): Promise<void> {
    console.info(`Syncing initial value for ${planetId}`);
    const contract = this.ethereumService.getContract();
    let result = await contract.getPlanet(planetId);
    let planet = this.planets[planetId];
    if (result.owner === this.ethereumService.getPlayerAddress()) {
      await this.syncRealPlanetStats(planet);
    }
    if (result.owner !== EthereumService.NULL_ADDRESS) {
      planet.conquer(result.owner, result.units.toNumber(), result.conquerBlockNumber);
    }
    planet.updateDynamicUnits(this.currentBlockNumber);
  }

  private async syncRealPlanetStats(planet: Planet): Promise<void> {
    if (!planet.isSynced) {
      const realStats = await this.ethereumService.getContract().getPlanetStats(planet.id);
      console.info(`Synced real values for planet ${planet.renderPlanetId()}`);
      planet.syncRealStats(realStats.unitsCost.toNumber(), realStats.unitsCreationRate.toNumber());
    }
  }

  private updateDynamicUnits(): void {
    this.planets.forEach(planet => {
      planet.updateDynamicUnits(this.currentBlockNumber);
    });
  }

  private notifyPlanets(): void {
    console.info('Updating planets');
    this.planetsSubject.next(Array.from(this.planets));
  }

}
