import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EthereumService } from '../ethereum.service';
import { PlanetService } from '../planet.service';

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.css']
})
export class IngameComponent implements OnInit {

  playerAddress: string;
  totalUnits: number = 0;
  totalProductionRate: number = 0;

  constructor(private ethereumService: EthereumService, public planetService: PlanetService, private router: Router) { }

  ngOnInit(): void {
    if (!this.ethereumService.isInitialized()) {
      this.router.navigateByUrl("");
      return;
    }
    this.planetService.initialize();
    this.playerAddress = this.ethereumService.getPlayerAddress();
  }

}
