import * as hashLib from 'hash.js';

export class Planet {

  public constructor(address: number, ownedBy?: number, currentUnits?: number, universeSize = 10000) {
// tslint:disable-next-line:no-bitwise
    const magnitude = (universeSize - address) ^ 2;
    const hash = hashLib.sha256().update(address + magnitude, 'hex').digest();
    this.address = address;

    this.unitCost = magnitude; // magnitude + magnitude * hash[0]; // TODO: Calculations
    this.unitProductionRate = magnitude * hash[1];

    this.ownedBy = ownedBy;
    this.currentUnits = Math.min(currentUnits, this.unitCost);
  }

  address: number; // ~53-bit integer

  ownedBy?: number;
  currentUnits?: number;

  readonly unitCost: number;
  readonly unitProductionRate: number;
  static filterPredicate(planet: Planet, filter: string): boolean {
    const defaultPredicate = (filterString: string): boolean => {
      // TODO: CurrentPlayer
      return `${planet.renderAddress()}${planet.unitCost}${planet.unitProductionRate}${planet.currentUnits ?? 0}${planet.renderOwnership(1)}`.toLowerCase().includes(filterString);
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
              state = state && planet.ownedBy === 1; // FIXME: How to CurrentUser
              break;
            }
            case 'none': {
              state = state && planet.ownedBy === 0;
              break;
            }
            case 'enemy': {
              state = state && !(planet.ownedBy === 0 || planet.ownedBy === 1); // FIXME: How to CurrentUser
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

  renderAddress(): string {
    return this.address.toString(16).toUpperCase();
  }

  renderOwnership(currentPlayer: number): string {
    switch (this.ownedBy) {
      case 0: {
        return 'None';
      }
      case currentPlayer: {
        return 'Me';
      }
      default: {
        return 'Enemy';
      }
    }
  }
}
