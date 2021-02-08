import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

const spaceYAbi = require('../assets/SpaceY.json');


@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  public static readonly NULL_ADDRESS: string = '0x0000000000000000000000000000000000000000';

  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private player_address: string;

  private contract: ethers.Contract;
  private contractAddress: string = "0xCfEB869F69431e42cdB54A4F4f105C19C080A601";

  private initialized = false;

  async connectToMetaMask(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await detectEthereumProvider({ mustBeMetaMask: true });

    const ethereum: any = window.ethereum;
    await ethereum.send('eth_requestAccounts');

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();
    this.player_address = await this.signer.getAddress();

    this.contract = new ethers.Contract(this.contractAddress, spaceYAbi.abi, this.provider).connect(this.signer);

    console.info('Initialized EthereumSerivce');
    this.initialized = true;
  }

  private initializeGuard(): void {
    if (!this.initialized) {
      throw new Error('Trying to access non initialized ethereum service ...');
    }
  }

  getContract(): ethers.Contract {
    this.initializeGuard();
    return this.contract;
  }

  getProvider(): ethers.providers.Web3Provider {
    this.initializeGuard();
    return this.provider;
  }

  getPlayerAddress(): string {
    this.initializeGuard();
    return this.player_address;
  }
}
