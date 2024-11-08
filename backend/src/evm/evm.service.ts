import { Injectable } from '@nestjs/common';
import { Alchemy, Network } from 'alchemy-sdk';
import { sepolia, polygonAmoy } from 'viem/chains';
import { InvalidChainIdException } from './evm.exceptions';
import { ethers } from 'ethers';

export enum SUPPORTED_CHAIN_IDS {
  SEPOLIA = sepolia.id,
  POLYGON_AMOY = polygonAmoy.id,
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
      [polygonAmoy.id]: new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY_BE,
        network: Network.MATIC_AMOY,
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
}
