import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
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
    const from = this.selectedFrom.filter(planet => planet.owner === this.ethereumService.getPlayerAddress()); // FIXME: CurrentUser

    if (!from || from.length === 0) {
      console.log('Select Planet to move from from the left side!');
      return;
    }

    if (!this.selectedTo || this.selectedTo.length === 0) {
      console.log('Select Planet to move to from right side!');
      return;
    }

    const contract = this.ethereumService.getContract();
    let sendPlanet = from[0];

    for (const planet of from) {
      if (planet == sendPlanet) {
        continue;
      }
      await contract.moveUnits(planet.id, sendPlanet.id, planet.getTotalUnits());
    }

    await contract.conquerPlanet(sendPlanet.id, this.selectedTo[0].id, sendPlanet.getTotalUnits());
  }
}
