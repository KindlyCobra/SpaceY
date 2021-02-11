import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Planet } from './planet';
import { EthereumService } from './ethereum.service';
import {ConsoleService} from './console.service';

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
      this.fetchAndPrintSyncDrift(planetId);
    });

    contract.on('UnitsSendToConquer', (fromPlanetId, toPlanetId, player, units) => {
      const fromPlanet = this.planets[fromPlanetId];
      console.info(`Player ${player} sended ${units} units from planet ${fromPlanet.renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()} to conquer it`);
      this.consoleService.addEntry(`Player ${player} sended ${units} units from planet ${fromPlanet.renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()} to conquer it`);
      fromPlanet.moveUnits(-units.toNumber());
      this.fetchAndPrintSyncDrift(fromPlanetId);
    });

    contract.on('UnitsMoved', (fromPlanetId, toPlanetId, player, units) => {
      console.info(`Player ${player} moved ${units} units from planet ${this.planets[fromPlanetId].renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()}`);
      this.consoleService.addEntry(`Player ${player} moved ${units} units from planet ${this.planets[fromPlanetId].renderPlanetId()} to ${this.planets[toPlanetId].renderPlanetId()}`);
      this.planets[fromPlanetId].moveUnits(-units.toNumber());
      this.planets[toPlanetId].moveUnits(units.toNumber());
      this.fetchAndPrintSyncDrift(fromPlanetId);
      this.fetchAndPrintSyncDrift(toPlanetId);
    });
  }

  private async loadInitialPlanets(): Promise<void> {
    const contract = this.ethereumService.getContract();
    const numPlanets = await contract.universeSize();

    this.planets = new Array(numPlanets);
    console.info('Starting planet initialisation for ' + numPlanets + ' planets');
    this.consoleService.addEntry('Starting planet initialisation for ' + numPlanets + ' planets');
    const promises: Promise<any>[] = new Array(numPlanets);

    for (let i = 0; i <= numPlanets; i++) {
      promises[i] = contract.getPlanet(i).then(async result => {
        const planet = new Planet(i, numPlanets);
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
    console.warn('All planets initialized');
    this.consoleService.addEntry('All planets initialized');
    this.notifyPlanets();
  }

  private async syncRealPlanetStats(planet: Planet): Promise<void> {
    if (!planet.isSynced) {
      const realStats = await this.ethereumService.getContract().getPlanetStats(planet.id);
      console.info(`Synced real values for planet ${planet.renderPlanetId()}`);
      this.consoleService.addEntry(`Synced real values for planet ${planet.renderPlanetId()}`);
      planet.syncRealStats(realStats.unitsCost.toNumber(), realStats.unitsCreationRate.toNumber());
    }
  }

  private async fetchAndPrintSyncDrift(planetId: number): Promise<void> {
    const result = await this.ethereumService.getContract().getUnitsOnPlanet(planetId);
    const planet = this.planets[planetId];
    console.info(`Received planet update for ${planet.renderPlanetId()}, is: ${planet.getTotalUnits()} should: ${result.toNumber()}`);
    this.consoleService.addEntry(`Received planet update for ${planet.renderPlanetId()}, is: ${planet.getTotalUnits()} should: ${result.toNumber()}`);
  }

  private updateDynamicUnits(): void {
    this.planets.forEach(planet => {
      planet.updateDynamicUnits(this.currentBlockNumber);
    });
  }

  private notifyPlanets(): void {
    console.info('Updating planets');
    this.consoleService.addEntry('Updating planets');
    this.planetsSubject.next(Array.from(this.planets));
  }

}
