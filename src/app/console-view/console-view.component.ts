import { Component, OnInit } from '@angular/core';
import {ConsoleService} from '../console.service';

// @ts-ignore
@Component({
  selector: 'app-console-view',
  templateUrl: './console-view.component.html',
  styleUrls: ['./console-view.component.css']
})
export class ConsoleViewComponent implements OnInit {

  constructor(private consoleService: ConsoleService) {}
  ngOnInit(): void { }

  getLog(): string {
    return this.consoleService.consolePrompts;
  }

}
