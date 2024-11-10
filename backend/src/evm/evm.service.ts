import { Injectable } from '@nestjs/common';
import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  SortingOrder,
} from 'alchemy-sdk';
import { sepolia, baseSepolia } from 'viem/chains';
import {
  InsufficientFundException,
  InvalidChainIdException,
} from './evm.exceptions';
import { ethers } from 'ethers';
import { EVMTransactionHistory } from './evm.interface';

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
        apiKey: process.env.ALCHEMY_API_KEY_BE,
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
   * TODO: implement
   */
  async getTransactionReceipt(chainId: number, txHash: string): Promise<any> {
    const alchemyClient = this.alchemyClients[chainId];
    if (!alchemyClient) {
      throw new InvalidChainIdException(chainId);
    }

    const transactionReceipt = await alchemyClient.core.getTransaction(txHash);

    return transactionReceipt;
  }

  /**
   * Get transaction history for a given address
   * Ref: https://docs.alchemy.com/reference/alchemy-getassettransfers
   * @param chainId
   * @param address
   * @returns
   */
  async getTransactionHistory(
    chainId: number,
    address: string,
  ): Promise<{ transactions: EVMTransactionHistory[]; minNonce: number }> {
    const alchemyClient = this.alchemyClients[chainId];
    if (!alchemyClient) {
      throw new InvalidChainIdException(chainId);
    }

    const transactionHistory = await alchemyClient.core.getAssetTransfers({
      fromAddress: address,
      toAddress: address,
      category: [
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.EXTERNAL,
      ],
      withMetadata: true,
      order: SortingOrder.DESCENDING,
    });

    const transactions = transactionHistory.transfers.map((transfer) => {
      return {
        timeStamp: new Date(transfer.metadata.blockTimestamp),
        from: transfer.from,
        to: transfer.to,
        value: transfer.value,
        hash: transfer.hash,
      };
    });

    // Get the earliest transaction nonce
    let minNonce = 0;
    const sortedTransactionsSentByAddress = transactions
      .filter(
        (transfer) =>
          transfer.from.toLocaleLowerCase() === address.toLocaleLowerCase(),
      )
      .sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());

    if (sortedTransactionsSentByAddress.length > 0) {
      const minNonceTxHash = sortedTransactionsSentByAddress[0].hash;
      const earliestTxReceipt = await this.getTransactionReceipt(
        chainId,
        minNonceTxHash,
      );
      minNonce = earliestTxReceipt.nonce || 0;
    }

    return { transactions, minNonce };
  }
}
