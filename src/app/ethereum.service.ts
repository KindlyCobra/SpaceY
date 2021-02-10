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
  private playerAddress: string;

  private contract: ethers.Contract;

  private connectedToMetaMask: boolean = false;
  private initializedContract: boolean = false;

  async connectToMetaMask(): Promise<boolean> {
    if (this.connectedToMetaMask) {
      return true;
    }

    await detectEthereumProvider({ mustBeMetaMask: true });

    const ethereum: any = window.ethereum;
    await ethereum.send('eth_requestAccounts');

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();
    this.playerAddress = await this.signer.getAddress();
    this.connectedToMetaMask = true;
    console.log(`Connected to metamask with account: ${this.playerAddress}`)
    return true;
  }

  async initializeContract(contractAddress: string): Promise<boolean> {
    if (!this.connectToMetaMask) {
      return false;
    }
    this.contract = new ethers.Contract(contractAddress, spaceYAbi.abi, this.provider).connect(this.signer);

    console.info('Initialized EthereumSerivce for contract at ' + contractAddress);
    this.initializedContract = true;
    return true;
  }

  private initializeGuard(): void {
    if (!this.initializedContract) {
      throw new Error('Trying to access non initialized ethereum service ...');
    }
    if (!this.connectedToMetaMask) {
      throw new Error('Trying to access ethereum service which in unconnected to metamask ...');
    }
  }

  isInitialized(): boolean {
    return this.initializedContract && this.connectedToMetaMask;
  }

  async isActivePlayer(): Promise<boolean> {
    this.initializeGuard();
    const result = await this.contract.startPlanets(this.getPlayerAddress());
    return result.conquerBlockNumber.toNumber() !== 0;
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
    return this.playerAddress;
  }
}
