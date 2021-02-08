import { Component, OnInit } from '@angular/core';
import { Transaction } from 'ethers';
import { EthereumService } from '../ethereum.service';
import { Planet } from '../planet';

@Component({
  selector: 'app-move-unit-view',
  templateUrl: './move-unit-view.component.html',
  styleUrls: ['./move-unit-view.component.css']
})
export class MoveUnitViewComponent implements OnInit {

  selectedFrom: Planet[] = [];
  selectedTo: Planet[] = [];

  ethereumService: EthereumService;

  constructor(ethereumService: EthereumService) {
    this.ethereumService = ethereumService;
  }

  ngOnInit(): void { }

  onSelectionChanged(where: 'left' | 'right', selection: Planet[]): void {
    if (where === 'left') {
      this.selectedFrom = selection;
    } else {
      this.selectedTo = selection;
    }
  }

  unitsToMove(): number {
    return this.selectedFrom.reduce((acc, planet) => acc + planet.getTotalUnits(), 0);
  }

  async moveUnits(): Promise<void> {
    const from = this.selectedFrom.filter(planet => planet.owner === this.ethereumService.getPlayerAddress());

    if (!from || from.length === 0) {
      console.log('Select Planet to move from from the left side!');
      return;
    }

    if (!this.selectedTo || this.selectedTo.length === 0) {
      console.log('Select Planet to move to from right side!');
      return;
    }

    const contract = this.ethereumService.getContract();
    const provider = this.ethereumService.getProvider();

    let sendPlanet: Planet;
    let isConquer = this.selectedTo[0].owner != this.ethereumService.getPlayerAddress();

    if (isConquer) {
      sendPlanet = from[0];
    } else {
      sendPlanet = this.selectedTo[0];
    }

    let moveTransactions = new Array<any>();

    for (const planet of from) {
      if (planet == sendPlanet) {
        continue;
      }
      console.info(`Moved ${planet.getTotalUnits()} units from ${planet.renderPlanetId()} to ${sendPlanet.renderPlanetId()}`);
      moveTransactions.push(await contract.moveUnits(planet.id, sendPlanet.id, planet.getTotalUnits()));
    }

    if (isConquer) {
      let moves = new Array<Promise<any>>();
      moveTransactions.forEach(transaction => {
        moves.push(provider.waitForTransaction(transaction.hash));
      });

      console.info(`Waiting for ${moves.length} transactions to clear before scheduling conquer`);
      await Promise.all(moves);
      console.info("All moves cleared, execute conquer!")

      let toPlanet = this.selectedTo[0];

      let shouldPlanet = await contract.getPlanet(sendPlanet.id);
      console.info(`From Planet should have units: ${shouldPlanet.units}`);

      shouldPlanet = await contract.getPlanetStats(toPlanet.id);
      console.info(`To Planet should have costs: ${shouldPlanet.unitsCost}`);

      console.assert(sendPlanet.getTotalUnits() >= toPlanet.unitCost);
      console.info(`Conquered ${toPlanet.renderPlanetId()} from ${sendPlanet.renderPlanetId()} with ${sendPlanet.getTotalUnits()} units`);
      await contract.conquerPlanet(sendPlanet.id, toPlanet.id, sendPlanet.getTotalUnits());
    }
  }
}
