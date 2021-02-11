import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EthereumService } from 'src/app/ethereum.service';

@Component({
  selector: 'start-menu-connect-metamask',
  templateUrl: './connect-metamask.component.html',
  styleUrls: ['./connect-metamask.component.css']
})
export class ConnectMetamaskComponent implements OnInit {

  connected: boolean = false;

  @Output() connectedToMetaMask: EventEmitter<any> = new EventEmitter();

  constructor(private ethereumSerive: EthereumService) { }

  async ngOnInit(): Promise<void> {
    this.connected = await this.ethereumSerive.connectToMetaMask();
    if (this.connected) {
      this.connectedToMetaMask.emit(null);
    }
  }

}
