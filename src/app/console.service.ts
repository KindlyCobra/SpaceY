import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {

  consolePrompts: string;

  public constructor() {
    this.consolePrompts = '';
  }

  addEntry(text: string): void {
    this.consolePrompts += new Date().getTime().toString() + ': ' + text + '\n';
  }
}
