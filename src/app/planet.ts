import { EthereumService } from "./ethereum.service";

export class Planet {
  public static ethereumSerivce: EthereumService;

  public constructor(planetId: number, universeSize: number) {
    // tslint:disable-next-line:no-bitwise
    const magnitude = (universeSize - planetId) ^ 2;
    this.id = planetId;

    this.unitCost = magnitude;
    this.unitProductionRate = Math.ceil(magnitude / 100);

    this.staticUnits = 0;
    this.dynamicUnits = 0;
  }
  readonly id: number;
  readonly unitCost: number;
  readonly unitProductionRate: number;

  owner?: string;
  staticUnits: number;
  dynamicUnits: number;
  conquerBlockNumber: number;

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
              state = state && planet.owner === Planet.ethereumSerivce.getPlayerAddress();
              break;
            }
            case 'none': {
              state = state && planet.owner === EthereumService.NULL_ADDRESS;
              break;
            }
            case 'enemy': {
              state = state && !(planet.owner === EthereumService.NULL_ADDRESS || planet.owner === Planet.ethereumSerivce.getPlayerAddress()); // FIXME: How to CurrentUser
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
    this.owner = owner;
    this.staticUnits = staticUnits;
    this.conquerBlockNumber = blockNumber;
  }

  moveUnits(units: number): void {
    this.staticUnits += units;
  }

  updateDynamicUnits(blockNumber: number) {
    if (typeof this.owner == "undefined") {
      return;
    }
    console.assert(blockNumber >= this.conquerBlockNumber);
    this.dynamicUnits = (blockNumber - this.conquerBlockNumber) * this.unitProductionRate;
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
      case Planet.ethereumSerivce.getPlayerAddress(): {
        return 'me';
      }
      default: {
        return this.owner;
      }
    }
  }
}
