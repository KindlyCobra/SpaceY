import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

interface ConsoleMessage {
  timestamp: Date;
  text: string;
  isError: boolean;
}

export enum Event {
  Success,
  Error
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {
  consolePrompts: ConsoleMessage[];
  subscribeToPrompts: Subject<ConsoleMessage[]>;

  public constructor(private snackBar: MatSnackBar) {
    this.consolePrompts = [];
    this.subscribeToPrompts = new Subject<ConsoleMessage[]>();
  }

  addEntry(text: string, event?: Event): void {
    this.consolePrompts.push({timestamp: new Date(), text, isError: event === Event.Error || false});
    this.subscribeToPrompts.next(this.consolePrompts);

    if (event !== undefined) {
      this.snackBar.open(text, undefined, {announcementMessage: Event[event], duration: 3000, verticalPosition: 'top', horizontalPosition: 'right', panelClass: `${Event[event].toLowerCase()}-snackbar`});
    }
  }
}
