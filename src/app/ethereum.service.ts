import { Injectable } from '@angular/core';
import { ethers } from "ethers";
import detectEthereumProvider from '@metamask/detect-provider';

let spaceYAbi = require('../assets/SpaceY.json');


@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;

  private contract: ethers.Contract;
  private contractAddress: string = "0xCfEB869F69431e42cdB54A4F4f105C19C080A601";

  private initialized: boolean = false;

  async connectToMetaMask() {
    if (this.initialized) {
      return;
    }
    await detectEthereumProvider({ mustBeMetaMask: true });

    var ethereum: any = window.ethereum;
    await ethereum.send('eth_requestAccounts');

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();

    this.contract = new ethers.Contract(this.contractAddress, spaceYAbi["abi"], this.provider).connect(this.signer);

    console.info("Initialized EthereumSerivce");
    this.initialized = true;
  }

  getContract(): ethers.Contract {
    if (!this.initialized) {
      throw new Error("Trying to access non initialized ethereum service ...");
    }
    return this.contract;
  }
}
