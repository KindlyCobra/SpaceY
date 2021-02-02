import * as hashLib from 'hash.js';

export class Planet {
  address: number; // ~53-bit integer

  ownedBy?: number;
  currentUnits?: number;

  readonly unitCost: number;
  readonly unitProductionRate: number;

  public constructor(address: number, ownedBy?: number, currentUnits?: number, universeSize = 10000) {
// tslint:disable-next-line:no-bitwise
    const magnitude = ((1 / universeSize) * address - universeSize) ^ 2;
    const hash = hashLib.sha256().update(address + magnitude, 'hex').digest();
    this.address = address;

    this.ownedBy = ownedBy;
    this.currentUnits = currentUnits;

    this.unitCost = magnitude + magnitude * hash[0]; // TODO: Calculations
    this.unitProductionRate = magnitude * hash[1];
  }
}
