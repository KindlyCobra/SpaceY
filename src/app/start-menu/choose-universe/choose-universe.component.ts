import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EthereumService } from '../../ethereum.service';

export class Universe {
  public readonly name: string;
  public readonly network: string;
  public readonly address: string;

  constructor(name: string, network: string, address: string) {
    this.name = name;
    this.network = network;
    this.address = address;
  }

  render(): string {
    return `${this.name}[${this.network}]: ${this.address}`;
  }
}

@Component({
  selector: 'start-menu-choose-universe',
  templateUrl: './choose-universe.component.html',
  styleUrls: ['./choose-universe.component.css']
})
export class ChooseUniverseComponent {

  readonly universes: Universe[] = [
    new Universe("HM PlayTest <Size: 10.000, Fee: 10>", "Görli", '0x7b7ab386aeac8679c992ce22b4e251787913abf4'),
    new Universe("General Test <Size: 10.000, Fee: 10>", "Görli", '0xa86fc98bc91682036f2dde3e779507a3656c373f'),
  ]

  isCustom: boolean = false;
  selectedUniverse: Universe = this.universes[0];
  customUniverseAddress: string = "";

  @Output() universeSelected: EventEmitter<string> = new EventEmitter();

  onOfficialUniverseSelected() {
    this.isCustom = false;
    console.info("Selected official");
  }

  onCustomUniverseSelected() {
    this.isCustom = true;
    console.info("Selected custom");
  }

  onCustomAddressChanged(event: any) {
    this.customUniverseAddress = event.target.value;
  }

  async onSelectUniverseClick() {
    if (!this.isCustom) {
      this.universeSelected.emit(this.selectedUniverse.address);
    } else {
      this.universeSelected.emit(this.customUniverseAddress);
    }
  }

}
