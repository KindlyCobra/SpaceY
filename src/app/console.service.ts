import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface ConsoleMessage {
  timestamp: Date;
  text: string;
  isError: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {

  consolePrompts: ConsoleMessage[];
  subscribeToPrompts: Subject<ConsoleMessage[]>;

  public constructor() {
    this.consolePrompts = [];
    this.subscribeToPrompts = new Subject<ConsoleMessage[]>();
  }

  addEntry(text: string, error?: boolean): void {
    this.consolePrompts.push({timestamp: new Date(), text, isError: error || false});
    this.subscribeToPrompts.next(this.consolePrompts);
  }
}
