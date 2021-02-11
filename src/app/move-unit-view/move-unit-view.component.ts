import {Component} from '@angular/core';
import {EthereumService} from '../ethereum.service';
import {Planet} from '../planet';
import {SelectionChange} from '@angular/cdk/collections';
import {ConsoleService, Event} from '../console.service';

@Component({
  selector: 'app-move-unit-view',
  templateUrl: './move-unit-view.component.html',
  styleUrls: ['./move-unit-view.component.css']
})
export class MoveUnitViewComponent {

  selectedFrom: Planet[] = [];
  selectedTo?: Planet;
  somethingSelectedTo: boolean;

  isMove = true;

  constructor(private ethereumService: EthereumService, private consoleService: ConsoleService) {}

  onSelectionChanged(where: 'left' | 'right', selection: SelectionChange<Planet>): void {
    if (where === 'left') {
      this.selectedFrom = selection.source.selected;
    } else {
      this.somethingSelectedTo = selection.source.selected.length > 0;
      if (selection.source.selected.length > 0) {
        this.selectedTo = selection.source.selected[0];
        this.isMove = this.selectedTo.owner === this.ethereumService.getPlayerAddress();
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
      this.consoleService.addEntry('Select source planet(s) from the left side!', Event.Error);
      return;
    }

    if (typeof this.selectedTo === undefined) {
      this.consoleService.addEntry('Select target planet from right side!', Event.Error);
      return;
    }

    if (this.selectedTo.owner !== EthereumService.NULL_ADDRESS && this.selectedTo.owner !== this.ethereumService.getPlayerAddress()) {
      this.consoleService.addEntry('Target planet has to be owned by none or yourself!', Event.Error);
      return;
    }

    if (this.selectedTo.isOrigin) {
      this.consoleService.addEntry('Cannot move units on to origin!', Event.Error);
      return;
    }

    const contract = this.ethereumService.getContract();

    const toPlanet = this.selectedTo;

    if (this.isMove) {
      for (const planet of from) {
        this.consoleService.addEntry(`Moving ${planet.getTotalUnits()} units from ${planet.renderPlanetId()} to ${toPlanet.renderPlanetId()}`);
        contract.moveUnits(planet.id, toPlanet.id, planet.getTotalUnits());
      }
    } else {
      const totalUnits = from.reduce((acc, planet) => acc + planet.getTotalUnits(), 0);
      const fromUnitAmounts = from.map(planet => planet.getTotalUnits());
      const fromPlanetIds = from.map(planet => planet.id);
      if (totalUnits < toPlanet.unitCost) {
        this.consoleService.addEntry(`The total selected amount ${totalUnits} is less than the costs ${toPlanet.unitCost}`, Event.Error);
        return;
      }
      this.consoleService.addEntry(`Conquering ${toPlanet.renderPlanetId()} from [${fromPlanetIds}] with [${fromUnitAmounts}] => ${totalUnits} units`, Event.Success);

      await contract.conquerPlanet(fromPlanetIds, toPlanet.id, fromUnitAmounts)
        .catch(() => this.consoleService.addEntry(`Error while trying to conquer.`, Event.Error));
    }
  }
}
