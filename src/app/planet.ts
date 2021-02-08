import * as hashLib from 'hash.js';

export class Planet {

  public constructor(planetId: number, universeSize: number) {
    // tslint:disable-next-line:no-bitwise
    const magnitude = (universeSize - planetId) ^ 2;
    this.id = planetId;

    this.unitCost = magnitude;
    this.unitProductionRate = Math.ceil(magnitude / 100);

    this.staticUnits = 0;
    this.dynamicUnits = 0;
  }
  readonly id: number; // ~53-bit integer
  readonly unitCost: number;
  readonly unitProductionRate: number;

  owner?: string;
  staticUnits: number;
  dynamicUnits: number;
  conquerBlockNumber: number;

  static filterPredicate(planet: Planet, filter: string): boolean {
    const defaultPredicate = (filterString: string): boolean => {
      // TODO: CurrentPlayer
      return `${planet.renderPlanetId()}${planet.unitCost}${planet.unitProductionRate}${planet.staticUnits + planet.dynamicUnits ?? 0}${planet.renderOwnership('0x1')}`.toLowerCase().includes(filterString);
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
              state = state && planet.owner === '0x1'; // FIXME: How to CurrentUser
              break;
            }
            case 'none': {
              state = state && planet.owner === '0x0';
              break;
            }
            case 'enemy': {
              state = state && !(planet.owner === '0x0' || planet.owner === '0x1'); // FIXME: How to CurrentUser
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

  renderPlanetId(): string {
    return '0x' + this.id.toString(16).toLowerCase();
  }

  renderOwnership(currentPlayer: string): string {
    switch (this.owner) {
      case '0x0': {
        return 'None';
      }
      case currentPlayer: {
        return 'Me';
      }
      default: {
        return this.owner;
      }
    }
  }
}
