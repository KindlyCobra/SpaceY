import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.css']
})
export class StartMenuComponent implements OnInit {
  tabIndex: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  onUniverseSelected(universe: string) {
    console.info(`Universe address ${universe} was selected`);
  }

}
