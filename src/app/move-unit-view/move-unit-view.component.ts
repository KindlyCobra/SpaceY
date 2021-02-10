import { Component, OnInit } from '@angular/core';
import { Transaction } from 'ethers';
import { EthereumService } from '../ethereum.service';
import { Planet } from '../planet';
import { PlanetTableViewComponent } from '../planet-table-view/planet-table-view.component';

@Component({
  selector: 'app-move-unit-view',
  templateUrl: './move-unit-view.component.html',
  styleUrls: ['./move-unit-view.component.css']
})
export class MoveUnitViewComponent implements OnInit {

  selectedFrom: Planet[] = [];
  selectedTo: Planet[] = [];


  constructor(private ethereumService: EthereumService) {
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

    const isConquer = this.selectedTo[0].owner !== this.ethereumService.getPlayerAddress();
    const toPlanet = this.selectedTo[0];

    if (!isConquer) {
      for (const planet of from) {
        console.info(`Moving ${planet.getTotalUnits()} units from ${planet.renderPlanetId()} to ${toPlanet.renderPlanetId()}`);
        contract.moveUnits(planet.id, toPlanet.id, planet.getTotalUnits());
      }
    } else {
      const totalUnits = from.reduce((acc, planet) => acc + planet.getTotalUnits(), 0);
      const fromUnitAmounts = from.map(planet => planet.getTotalUnits());
      const fromPlanetIds = from.map(planet => planet.id);
      console.assert(totalUnits >= toPlanet.unitCost);
      console.info(`Conquering ${toPlanet.renderPlanetId()} from [${fromPlanetIds}] with [${fromUnitAmounts}] => ${totalUnits} units`);
      await contract.conquerPlanet(fromPlanetIds, toPlanet.id, fromUnitAmounts);
    }
  }
}
