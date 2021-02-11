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
    this.isOrigin = planetId === universeSize;
  }

  readonly id: number;
  readonly isOrigin: boolean;
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

    let parts = filter.split(' ');
    let state = true;

    parts = parts.map(part => {
      switch (part.toLowerCase()) {
        case '$me':
          return Planet.ethereumService.getPlayerAddress();
        case '$none':
          return EthereumService.NULL_ADDRESS;
        default:
          return part;
      }
    });

    const filterStrings = [];

    try {
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('#')) {
          const accessor = parts[i].slice(1);
          if (!(accessor in planet)) {
            // console.log(accessor + ' not found in planet.');
            continue;
          } else if (planet[accessor] === undefined) {
            return false;
          }

          let operation: (a, b) => boolean;

          switch (parts[++i].toLowerCase()) {
            case '>':
            case 'gt':
              operation = (a, b) => a > b;
              break;

            case '<':
            case 'lt':
              operation = (a, b) => a < b;
              break;

            case '>=':
            case 'gte':
              operation = (a, b) => a >= b;
              break;


            case '<=':
            case 'lte':
              operation = (a, b) => a <= b;
              break;

            case 'eq':
            case '=':
              operation = (a, b) => a === b;
              break;

            case 'neq':
            case '!=':
              operation = (a, b) => a !== b;
              break;

            default:
              operation = () => true;
          }

          let operand: number | string;

          if (typeof planet[accessor] === 'number') {
            operand = Number.parseFloat(parts[++i]);
            if (Number.isNaN(operand)) {
              return true;
            }
          } else {
            operand = parts[++i];
          }

          state &&= operation(planet[accessor], operand);
        } else {
          filterStrings.push(parts[i]);
        }
      }
    } catch (e) {
      return true;
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

  get units(): number {
    return this.getTotalUnits();
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
        return `none  <${this.renderOwnershipShort()}>`;
      }
      case Planet.ethereumService.getPlayerAddress(): {
        return `me    <${this.renderOwnershipShort()}>`;
      }
      default: {
        return `enemy <${this.renderOwnershipShort()}>`;
      }
    }
  }

  renderOwnershipShort(): string {
    return this.owner.substr(0, 6) + '...' + this.owner.substr(this.owner.length - 3, 3);
  }

  isPlayerOwned(): boolean {
    return this.owner === Planet.ethereumService.getPlayerAddress();
  }
}
