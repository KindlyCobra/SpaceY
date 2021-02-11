import { Component, OnInit } from '@angular/core';
import {ConsoleService} from '../console.service';

// @ts-ignore
@Component({
  selector: 'app-console-view',
  templateUrl: './console-view.component.html',
  styleUrls: ['./console-view.component.css']
})
export class ConsoleViewComponent implements OnInit {

  displayedColumns = ['timestamp', 'message'];

  constructor(public consoleService: ConsoleService) {}
  ngOnInit(): void { }


}
