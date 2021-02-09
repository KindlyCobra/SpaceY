import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Planet } from './planet';
import { EthereumService } from './ethereum.service';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {
  private planets: Planet[];
  private planetsSubject: Subject<Planet[]>;

  private currentBlockNumber: number;

  private initialized = false;

  constructor(private ethereumService: EthereumService) {
    this.planetsSubject = new Subject();
    void this.initialize();
  }

  onNewPlanets(): Observable<Planet[]> {
    return this.planetsSubject;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    Planet.ethereumService = this.ethereumService;
    await this.ethereumService.connectToMetaMask();
    this.currentBlockNumber = await this.ethereumService.getProvider().getBlockNumber();
    this.isActivePlayer();
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
      this.notifyPlanets();
    });

    contract.on('PlanetConquered', (planetId, player, units) => {
      console.info(`Player ${player} conquered planet ${planetId}`);
      this.planets[planetId].conquer(player, units, this.currentBlockNumber);
    });

    contract.on('UnitsMoved', (fromPlanetId, toPlanetId, player, units) => {
      console.info(`Player ${player} moved ${units} units from planet ${fromPlanetId} to ${toPlanetId}`);
      this.planets[fromPlanetId].moveUnits(-units);
      this.planets[toPlanetId].moveUnits(units);
    });
  }

  private async loadInitialPlanets(): Promise<void> {
    const contract = this.ethereumService.getContract();
    const numPlanets = await contract.universeSize();

    this.planets = new Array(numPlanets);
    console.info('Starting planet initialisation for ' + numPlanets + ' planets');

    const promises: Promise<any>[] = new Array(numPlanets);

    for (let i = 0; i <= numPlanets; i++) {
      promises[i] = contract.planets(i).then(result => {
        this.planets[i] = new Planet(i, numPlanets);
        if (result.owner !== EthereumService.NULL_ADDRESS) {
          this.planets[i].conquer(result.owner, result.units, result.conquerBlockNumber);
        }
      });
    }
    await Promise.all(promises);
    console.warn('All planets initialized');

    this.notifyPlanets();
  }

  private async isActivePlayer(): Promise<void> {
    const contract = this.ethereumService.getContract();

    const result = await contract.playerStartBlocks(this.ethereumService.getPlayerAddress());
    if (result.toNumber() === 0) {
      console.warn('Player is not active in this universum!');
    } else {
      console.info('Player is active in this universum');
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
