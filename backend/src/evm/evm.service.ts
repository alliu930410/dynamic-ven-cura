import { Injectable } from '@nestjs/common';
import { Alchemy, Network } from 'alchemy-sdk';
import { sepolia, polygonAmoy, baseSepolia } from 'viem/chains';
import { InvalidChainIdException } from './evm.exceptions';
import { ethers } from 'ethers';

export enum SUPPORTED_CHAIN_IDS {
  SEPOLIA = sepolia.id,
  BASE_SEPOLIA = baseSepolia.id,
}

@Injectable()
export class EVMService {
  alchemyClients: Record<number, Alchemy>;

  constructor() {
    this.alchemyClients = {
      [sepolia.id]: new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.ETH_SEPOLIA,
      }),
      [baseSepolia.id]: new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY_BE,
        network: Network.BASE_SEPOLIA,
      }),
    };
  }

  async getBalance(chainId: number, address: string): Promise<string> {
    const alchemyClient = this.alchemyClients[chainId];
    if (!alchemyClient) {
      throw new InvalidChainIdException(chainId);
    }

    const balance = await alchemyClient.core.getBalance(address, 'latest');
    const balanceInEther = ethers.formatEther(balance.toString());

    return balanceInEther;
  }

  /**
   * Send a transaction to the EVM
   * @param to recipient address
   * @param amountInEth amount to send in ETH
   * @returns transaction hash of the submitted transaction
   */
  async sendTransaction(to: string, amountInEth: number): Promise<string> {}

  /**
   * Retrieves the transaction receipt for a given transaction hash
   * @param txHash transaction hash
   * TODO: implement
   */
  async getTransactionReceipt(txHash: string): Promise<any> {}
}
