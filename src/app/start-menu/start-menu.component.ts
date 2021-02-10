import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EthereumService } from '../ethereum.service';
import { InitialPlanetComponent } from './initial-planet/initial-planet.component';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.css']
})
export class StartMenuComponent implements OnInit {
  @ViewChild("initialPlanetChild") initialPlanetChild: InitialPlanetComponent;

  tabIndex: number = 0;

  constructor(private ethereumSerivce: EthereumService, private router: Router) { }

  ngOnInit(): void {
  }

  onConnectedToMetaMask() {
    console.info(`Connected to meta mask!`);
    this.tabIndex = 1;
  }

  async onUniverseSelected(universeAddress: string) {
    console.info(`Universe address ${universeAddress} was selected`);
    let success = await this.ethereumSerivce.initializeContract(universeAddress);
    if (!success) {
      console.error("Not connected to MetaMask, athought it should!")
      this.tabIndex = 0;
    } else {
      this.initialPlanetChild.onUniverseChoosen();
      this.tabIndex = 2;
    }
  }

  onBoughtInitialPlanet() {
    this.router.navigateByUrl("ingame");
  }

}
