import { Component, Output, EventEmitter } from '@angular/core';
import { assert } from 'console';
import { EthereumService } from 'src/app/ethereum.service';

@Component({
  selector: 'start-menu-initial-planet',
  templateUrl: './initial-planet.component.html',
  styleUrls: ['./initial-planet.component.css']
})
export class InitialPlanetComponent {

  metaMaskInitialized: boolean = false;

  buyInitialPlanet: boolean = false;
  price: number = 0;

  @Output() boughtInitialPlanet: EventEmitter<any> = new EventEmitter();

  constructor(private ethereumService: EthereumService) { }

  async onUniverseChoosen() {
    this.metaMaskInitialized = true;
    let isActive = await this.ethereumService.isActivePlayer();
    if (!isActive) {
      this.buyInitialPlanet = true;
      this.price = await this.ethereumService.getContract().startCost();
    } else {
      this.boughtInitialPlanet.emit(null);
    }
  }

  async onBuyInitialPlanetPressed() {
    await this.ethereumService.getContract().buyInitialPlanet({ value: this.price });
    console.assert(await this.ethereumService.isActivePlayer());
    this.boughtInitialPlanet.emit(null);
  }

}
