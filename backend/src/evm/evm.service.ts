import { Injectable } from '@nestjs/common';
import { Alchemy, Network, TransactionReceipt } from 'alchemy-sdk';
import { sepolia, polygonAmoy, baseSepolia } from 'viem/chains';
import {
  InsufficientFundException,
  InvalidChainIdException,
} from './evm.exceptions';
import { ethers } from 'ethers';
import MyEtherscanProvider from './etherscan.provider';

export enum SUPPORTED_CHAIN_IDS {
  SEPOLIA = sepolia.id,
  BASE_SEPOLIA = baseSepolia.id,
}

@Injectable()
export class EVMService {
  alchemyClients: Record<number, Alchemy>;
  chainIdToProviderUrl: Record<number, string>;

  constructor() {
    this.alchemyClients = {
      [sepolia.id]: new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.ETH_SEPOLIA,
      }),
      [baseSepolia.id]: new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.BASE_SEPOLIA,
      }),
    };

    this.chainIdToProviderUrl = {
      [sepolia.id]: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      [baseSepolia.id]: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_BE}`,
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
   * @param signerWallet authenticated wallet with chain provider that is sending the transaction
   * @param to recipient address
   * @param amountInEth amount to send in ETH
   * @returns transaction hash of the submitted transaction
   */
  async sendTransaction(
    signerWallet: ethers.Wallet,
    to: string,
    amountInEth: number,
  ): Promise<{
    transactionHash: string;
    nonce: number;
  }> {
    try {
      const tx = await signerWallet.sendTransaction({
        to,
        value: ethers.parseEther(amountInEth.toString()),
      });

      return { transactionHash: tx.hash, nonce: tx.nonce };
    } catch (error: any) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new InsufficientFundException();
      }
    }
  }

  /**
   * Gets Alchemy provider for a given chain id
   * @param chainId
   */
  async getProviderForChainId(
    chainId: number,
  ): Promise<ethers.JsonRpcProvider> {
    const providerUrl = this.chainIdToProviderUrl[chainId];
    if (!providerUrl) {
      throw new InvalidChainIdException(chainId);
    }

    return new ethers.JsonRpcProvider(providerUrl);
  }

  /**
   * Retrieves the transaction receipt for a given transaction hash
   * @param txHash transaction hash
   */
  async getTransactionReceipt(
    chainId: number,
    txHash: string,
  ): Promise<TransactionReceipt | null> {
    const alchemyClient = this.alchemyClients[chainId];
    if (!alchemyClient) {
      throw new InvalidChainIdException(chainId);
    }

    return await alchemyClient.core.getTransactionReceipt(txHash);
  }

  async getTransactionHistory(chainId: number, address: string): Promise<any> {
    const etherscanProvider = new MyEtherscanProvider(
      chainId,
      process.env.ETHERSCAN_API_KEY,
    );

    const transactionHistory = await etherscanProvider.getHistory(address);

    // Filter for:
    // - Transactions sent by the address
    // - Sort by nonce in descending order
    return transactionHistory.sort(
      (a: any, b: any) => b.timeStamp - a.timeStamp,
    );
  }
}
