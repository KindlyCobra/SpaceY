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
  @ViewChild('initialPlanetChild') initialPlanetChild: InitialPlanetComponent;

  tabIndex = 0;

  constructor(private ethereumService: EthereumService, private router: Router) { }

  ngOnInit(): void {
  }

  onConnectedToMetaMask(): void {
    console.info(`Connected to meta mask!`);
    this.tabIndex = 1;
  }

  async onUniverseSelected(universeAddress: string): Promise<void> {
    console.info(`Universe address ${universeAddress} was selected`);
    const success = await this.ethereumService.initializeContract(universeAddress);
    if (!success) {
      console.error('Not connected to MetaMask, athought it should!');
      this.tabIndex = 0;
    } else {
      this.initialPlanetChild.onUniverseChoosen();
      this.tabIndex = 2;
    }
  }

  onBoughtInitialPlanet(): void {
    this.router.navigateByUrl('ingame');
  }

}
