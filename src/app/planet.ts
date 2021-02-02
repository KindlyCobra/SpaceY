export class Planet {
  address: number; // ~53-bit integer

  ownedBy?: number;
  currentUnits?: number;

  readonly unitCost: number;
  readonly unitProductionRate: number;

  public constructor(address: number, ownedBy?: number, currentUnits?: number) {
    this.address = address;

    this.ownedBy = ownedBy;
    this.currentUnits = currentUnits;

    this.unitCost = 53.2323 * address; // TODO: Calculations
    this.unitProductionRate = 25545 * this.unitCost;
  }
}
