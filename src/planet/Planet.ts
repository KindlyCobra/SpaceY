class Planet {
  address: number; // ~53-bit integer

  readonly unitCost: number;
  readonly unitProductionRate: number;

  public constructor(address: number) {
    this.address = address;

    this.unitCost = 53.2323 * address; // TODO: Calculations
    this.unitProductionRate = 25545 * this.unitCost;
  }
}
