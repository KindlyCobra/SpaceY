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
  selector: 'app-choose-universe',
  templateUrl: './choose-universe.component.html',
  styleUrls: ['./choose-universe.component.css']
})
export class ChooseUniverseComponent {

  readonly universes: Universe[] = [
    new Universe("Main", "Görli", '0xF633F3fBBf679cde9cdaC74Ec94c16D6F8DaB353'),
    new Universe("Test1", "Görli", '0xF633F3fBBf679cde9cdaC74Ec94c16D6F8DaB353'),
    new Universe("Test2", "Görli", '0xF633F3fBBf679cde9cdaC74Ec94c16D6F8DaB353'),
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
