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
export class MoveUnitViewComponent {

  selectedFrom: Planet[] = [];
  selectedTo?: Planet;
  somethingSelectedTo: boolean;

  totalSelectedUnits: number = 0;
  isMove: boolean = true;

  constructor(private ethereumService: EthereumService) {
  }

  onSelectionChanged(where: 'left' | 'right', selection: Planet[]): void {
    if (where === 'left') {
      this.selectedFrom = selection;
      this.totalSelectedUnits = this.unitsToMove();
    } else {
      this.somethingSelectedTo = selection.length > 0;
      if (selection.length > 0) {
        this.selectedTo = selection[0];
        this.isMove = this.selectedTo.owner == this.ethereumService.getPlayerAddress();
      } else {
        this.selectedTo = undefined;
      }
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

    if (typeof this.selectedTo === undefined) {
      console.log('Select Planet to move to from right side!');
      return;
    }

    if (this.selectedTo.owner != EthereumService.NULL_ADDRESS && this.selectedTo.owner != this.ethereumService.getPlayerAddress()) {
      console.error("SelectedTo has either to be a empty or own planet");
      return
    }

    const contract = this.ethereumService.getContract();

    const toPlanet = this.selectedTo;

    if (this.isMove) {
      for (const planet of from) {
        console.info(`Moving ${planet.getTotalUnits()} units from ${planet.renderPlanetId()} to ${toPlanet.renderPlanetId()}`);
        contract.moveUnits(planet.id, toPlanet.id, planet.getTotalUnits());
      }
    } else {
      const totalUnits = from.reduce((acc, planet) => acc + planet.getTotalUnits(), 0);
      const fromUnitAmounts = from.map(planet => planet.getTotalUnits());
      const fromPlanetIds = from.map(planet => planet.id);
      if (totalUnits < toPlanet.unitCost) {
        console.error(`The total selected amount ${totalUnits} is less then the costs ${toPlanet.unitCost}`);
        return;
      }
      console.info(`Conquering ${toPlanet.renderPlanetId()} from [${fromPlanetIds}] with [${fromUnitAmounts}] => ${totalUnits} units`);
      await contract.conquerPlanet(fromPlanetIds, toPlanet.id, fromUnitAmounts);
    }
  }
}
