import { Component, OnInit } from '@angular/core';
import {Planet} from '../planet';

@Component({
  selector: 'app-move-unit-view',
  templateUrl: './move-unit-view.component.html',
  styleUrls: ['./move-unit-view.component.css']
})
export class MoveUnitViewComponent implements OnInit {

  selectedFrom: Planet[] = [];
  selectedTo: Planet[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  onSelectionChanged(where: 'left' | 'right', selection: Planet[]): void {
    if (where === 'left') {
      this.selectedFrom = selection;
    } else {
      this.selectedTo = selection;
    }
  }

  unitsToMove(): number {
    return this.selectedFrom.reduce((acc, planet) => acc + planet.currentUnits, 0);
  }

  moveUnits(): void {
    const from = this.selectedFrom.filter(planet => planet.ownedBy === 1); // FIXME: CurrentUser

    if (!from || from.length === 0) {
      console.log('Select Planet to move from from the left side!');
      return;
    }

    if (!this.selectedTo || this.selectedTo.length === 0) {
      console.log('Select Planet to move to from right side!');
      return;
    }

    for (const planet of from) {
      console.log(`Moving ${planet.currentUnits} units from ${planet.renderAddress()} to ${this.selectedTo[0].renderAddress()}.`);
    }
  }
}
