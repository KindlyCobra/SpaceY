import { EthereumService } from './ethereum.service';

export class Planet {
  public static ethereumService: EthereumService;

  public constructor(planetId: number, universeSize: number) {
    const magnitude = Math.pow(universeSize - planetId, 2);
    this.id = planetId;

    this.unitCost = magnitude;
    const productionRate = Math.ceil(magnitude / 100.0);
    this.unitProductionRate = productionRate > 0 ? productionRate : 1;

    this.staticUnits = 0;
    this.dynamicUnits = 0;
  }

  readonly id: number;
  unitCost: number;
  unitProductionRate: number;

  owner: string = EthereumService.NULL_ADDRESS;
  staticUnits: number;
  dynamicUnits: number;
  conquerBlockNumber: number;

  isSynced = false;

  static filterPredicate(planet: Planet, filter: string): boolean {
    const defaultPredicate = (filterString: string): boolean => {
      // TODO: CurrentPlayer
      return `${planet.renderPlanetId()}${planet.unitCost}${planet.unitProductionRate}${planet.getTotalUnits()}${planet.renderOwnership()}`.toLowerCase().includes(filterString);
    };

    const parts = filter.split(' ');
    let state = true;

    const filterStrings = [];
    for (let i = 0; i < parts.length; i++) {
      switch (parts[i]) {
        case 'ownedby:': {
          const opt = parts[++i];

          switch (opt) {
            case 'me': {
              state = state && planet.owner === Planet.ethereumService.getPlayerAddress();
              break;
            }
            case 'none': {
              state = state && planet.owner === EthereumService.NULL_ADDRESS;
              break;
            }
            case 'enemy': {
              state = state && !(planet.owner === EthereumService.NULL_ADDRESS || planet.owner === Planet.ethereumService.getPlayerAddress()); // FIXME: How to CurrentUser
              break;
            }
            default: {
              throw new Error('Unknown "ownedBy:" selector ' + opt);
            }
          }
          break;
        }
        default: {
          filterStrings.push(parts[i]);
        }
      }
    }

    return state && defaultPredicate(filterStrings.join(' '));
  }

  conquer(owner: string, staticUnits: number, blockNumber: number): void {
    console.info(`Player ${owner} conquered planet ${this.id} with ${staticUnits} units @${blockNumber}`);
    this.owner = owner;
    this.staticUnits = staticUnits;
    this.conquerBlockNumber = blockNumber;
  }

  moveUnits(units: number): void {
    this.staticUnits += units;
  }

  updateDynamicUnits(blockNumber: number): void {
    if (this.owner === EthereumService.NULL_ADDRESS) {
      return;
    }
    console.assert(blockNumber >= this.conquerBlockNumber);
    this.dynamicUnits = (blockNumber - this.conquerBlockNumber) * this.unitProductionRate;
    console.log(`Updated total units on ${this.renderPlanetId()} to ${this.getTotalUnits()}(${this.staticUnits}/${this.dynamicUnits})`);
  }

  syncRealStats(unitCost: number, productionRate: number): void {
    this.isSynced = true;
    this.unitCost = unitCost;
    this.unitProductionRate = productionRate;
  }

  getTotalUnits(): number {
    return this.staticUnits + this.dynamicUnits;
  }

  renderPlanetId(): string {
    return '0x' + this.id.toString(16).toLowerCase();
  }

  renderOwnership(): string {
    switch (this.owner) {
      case EthereumService.NULL_ADDRESS: {
        return 'none';
      }
      case Planet.ethereumService.getPlayerAddress(): {
        return 'me';
      }
      default: {
        return this.owner;
      }
    }
  }
}
