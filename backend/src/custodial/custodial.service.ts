import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { pick } from 'lodash';
import {
  CreateCustodialWalletDto,
  GetBalanceDto,
  GetCustodialWalletsDto,
  GetTransactionHistoryDto,
  PaginatedMessageHistoryDto,
  SendTransactionReceiptDto,
  SignedMessageDto,
} from './custodial.dto';
import { generateKey } from 'src/utils/keygen';
import { decryptKey, encryptKey } from 'src/utils/crypto';
import { EVMService } from 'src/evm/evm.service';
import { Prisma } from '@prisma/client';
import { ethers, Provider } from 'ethers';
import {
  HasPendingTransactionException,
  WalletNotFoundException,
} from './custodial.exceptions';

@Injectable()
export class CustodialService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly evmService: EVMService,
  ) {}

  async getWallets(dynamicUserId: string): Promise<GetCustodialWalletsDto[]> {
    const wallets = await this.prismaService.custodialWallet.findMany({
      where: {
        user: {
          dynamicUserId: dynamicUserId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return wallets.map((wallet) =>
      pick(wallet, ['address', 'nickName', 'publicKey', 'createdAt']),
    );
  }

  async createWallet(dynamicUserId: string): Promise<CreateCustodialWalletDto> {
    // Generate a new key pair
    const { address, publicKey, privateKey } = generateKey();

    // Encode the private key for storage
    const { encryptedKey, iv } = encryptKey(privateKey);

    // Parse default nickName
    const totalWallets = await this.prismaService.custodialWallet.count({
      where: {
        user: {
          dynamicUserId,
        },
      },
    });

    // Note: this might have conditions if multiple wallets are created at the same time
    // we can fix this by using a transaction or raw SQL query
    // but for the sake of simplicity, we will ignore this for now
    const nickName = `Account ${totalWallets + 1}`;

    // Create user if not already exists, then create & associate wallet
    await this.prismaService.user.upsert({
      where: { dynamicUserId },
      update: {
        custodialWallets: {
          create: {
            address,
            nickName,
            privateKey: encryptedKey,
            privateKeyIV: iv,
            publicKey,
          },
        },
      },
      create: {
        dynamicUserId,
        custodialWallets: {
          create: {
            address,
            nickName,
            privateKey: encryptedKey,
            privateKeyIV: iv,
            publicKey,
          },
        },
      },
    });

    return {
      address,
      nickName,
      publicKey,
    };
  }

  async getBalance(chainId: number, address: string): Promise<GetBalanceDto> {
    const balance = await this.evmService.getBalance(
      chainId,
      address.toLocaleLowerCase(),
    );
    return {
      address,
      balance,
    };
  }

  async signMessage(
    dynamicUserId: string,
    address: string,
    message: string,
  ): Promise<SignedMessageDto> {
    const wallet = await this.getSigningWallet(dynamicUserId, address);
    const signature = await wallet.signMessage(message);

    // Encode the signature to be stored in the database
    const { encryptedKey, iv } = encryptKey(signature);
    await this.prismaService.messageHistory.create({
      data: {
        message,
        signature: encryptedKey,
        signatureIV: iv,
        custodialWallet: {
          connect: {
            address,
          },
        },
      },
    });

    return { address, message, signature };
  }

  private async getSigningWallet(
    dynamicUserId: string,
    address: string,
    provider: Provider | null = null,
  ): Promise<ethers.Wallet> {
    const wallet = await this.prismaService.custodialWallet.findFirst({
      where: {
        user: {
          dynamicUserId,
        },
        address: {
          equals: address,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    });

    if (!wallet) {
      throw new WalletNotFoundException(address);
    }

    const { privateKey, privateKeyIV } = wallet;
    const decryptedKey = decryptKey(privateKey, privateKeyIV);

    return new ethers.Wallet(decryptedKey, provider);
  }

  /**
   * Send a transaction to the EVM
   * @param dynamicUserId dynamic user that is sending the transaction
   * @param chainId chain id of the network
   * @param to recipient address
   * @param amountInEth amount to send in ETH
   * @returns transaction hash of the submitted transaction
   */
  async sendTransaction(
    dynamicUserId: string,
    chainId: number,
    address: string,
    to: string,
    amountInEth: number,
  ): Promise<SendTransactionReceiptDto> {
    // Check if user has a last pending transaction that's not sealed
    const lastPendingTransaction =
      await this.prismaService.transactionHistory.findFirst({
        where: {
          chainId,
          custodialWallet: {
            address,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    if (lastPendingTransaction) {
      const txReceipt = await this.evmService.getTransactionReceipt(
        chainId,
        lastPendingTransaction.transactionHash,
      );

      if (!txReceipt) {
        throw new HasPendingTransactionException(
          lastPendingTransaction.transactionHash,
        );
      }
    }
    const provider = await this.evmService.getProviderForChainId(chainId);
    const signingWallet = await this.getSigningWallet(
      dynamicUserId,
      address,
      provider,
    );

    try {
      const { transactionHash, nonce } = await this.evmService.sendTransaction(
        signingWallet,
        to,
        amountInEth,
      );

      const { isInternal, nickName, toWalletId } = await this.isInternalWallet(
        dynamicUserId,
        to,
      );

      await this.prismaService.transactionHistory.create({
        data: {
          chainId,
          toAddress: to,
          amountInEth,
          transactionHash,
          nonce,
          isInternal,
          custodialWallet: {
            connect: {
              address,
            },
          },
          ...(isInternal
            ? {
                toCustodialWallet: {
                  connect: {
                    id: toWalletId,
                  },
                },
              }
            : {}),
        },
      });

      return {
        chainId,
        address,
        to,
        amountInEth,
        transactionHash,
        nonce,
      };
    } catch (error) {
      // TODO: add error handling if anything unexpected happens
      console.log('Error sending transaction', error);
      throw error;
    }
  }

  async getMessageHistory(
    dynamicUserId: string,
    address: string,
    page: number = 1, // default to first page if not specified
    limit: number = 20, // default to 10 messages per page if not specified
  ): Promise<PaginatedMessageHistoryDto> {
    const wallet = await this.getSigningWallet(dynamicUserId, address);
    if (!wallet) {
      throw new WalletNotFoundException(address);
    }

    const [messages, totalCount] = await Promise.all([
      this.prismaService.messageHistory.findMany({
        where: {
          custodialWallet: {
            address,
          },
        },
        skip: limit * ((page > 0 ? page : 1) - 1),
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.messageHistory.count({
        where: {
          custodialWallet: {
            address,
          },
        },
      }),
    ]);

    const totalPages = totalCount < limit ? 1 : Math.ceil(totalCount / limit);

    return {
      page,
      pageSize: limit,
      totalCount,
      totalPages,
      items: messages.map((message) => ({
        address,
        message: message.message,
        createdAt: message.createdAt,
      })),
    };
  }

  async getTransactionHistory(
    chainId: number,
    address: string,
  ): Promise<GetTransactionHistoryDto[]> {
    const transactions = await this.evmService.getTransactionHistory(
      chainId,
      address,
    );

    // Serialize the transactions to only include necessary fields and limit to 100 transactions
    const onchainTransactions = transactions
      .map((tx: any) => ({
        from: tx.from,
        to: tx.to,
        transactionHash: tx.hash,
        nonce: Number(tx.nonce),
        amountInEth: ethers.formatEther(tx.value),
        createdAt: new Date(tx.timeStamp * 1000),
        direction:
          tx.from.toLocaleLowerCase() === address.toLocaleLowerCase()
            ? 'outgoing'
            : 'incoming',
        sealed: true,
      }))
      .slice(0, 100);

    // Mark internal transactions and include nickName if the transaction is internal
    const dbOnchainTransactions =
      await this.prismaService.transactionHistory.findMany({
        where: {
          chainId,
          transactionHash: {
            in: onchainTransactions.map((tx: any) => tx.transactionHash),
          },
          OR: [
            {
              custodialWallet: {
                address,
              },
            },
            {
              toCustodialWallet: {
                address,
              },
            },
          ],
        },
        include: {
          custodialWallet: true,
          toCustodialWallet: true,
        },
      });

    onchainTransactions.forEach((tx: any) => {
      const dbTx = dbOnchainTransactions.find(
        (dbTx) => dbTx.transactionHash === tx.transactionHash,
      );

      const counterpartNickName =
        tx.direction === 'incoming'
          ? dbTx?.custodialWallet?.nickName
          : dbTx?.toCustodialWallet?.nickName;

      tx.isInternal = dbTx?.isInternal || false;
      tx.nickName = counterpartNickName;
    });

    // Fetch pending transactions from the database if transactionHash not in onchainTransactions
    // and nonce is greater than or equal to the minimum nonce in onchainTransactions
    const minNonce =
      onchainTransactions.length > 0
        ? Math.min(...onchainTransactions.map((tx) => Number(tx.nonce)))
        : 0;

    const pendingTransactions =
      await this.prismaService.transactionHistory.findMany({
        where: {
          chainId,
          custodialWallet: {
            address,
          },
          transactionHash: {
            notIn: onchainTransactions.map((tx: any) => tx.transactionHash),
          },
          nonce: {
            gte: minNonce,
          },
        },
        include: {
          toCustodialWallet: true,
        },
      });

    const serializedPendingTransactions = pendingTransactions.map((tx) => ({
      from: address,
      to: tx.toAddress,
      transactionHash: tx.transactionHash,
      nonce: tx.nonce,
      createdAt: tx.createdAt,
      amountInEth: tx.amountInEth,
      isInternal: tx.isInternal,
      nickName: tx.toCustodialWallet?.nickName,
      direction: 'outgoing',
      sealed: false,
    }));

    return [...serializedPendingTransactions, ...onchainTransactions].sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }

  /**
   * Returns boolean indicating if the wallet is an internal wallet for the dynamic user
   * @param dynamicUserId
   * @param address
   */
  async isInternalWallet(
    dynamicUserId: string,
    address: string,
  ): Promise<{
    isInternal: boolean;
    toWalletId?: number;
    nickName?: string | null;
  }> {
    const wallet = await this.prismaService.custodialWallet.findFirst({
      where: {
        user: {
          dynamicUserId,
        },
        address: {
          equals: address,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    });

    const insInternal = !!wallet;
    return {
      isInternal: insInternal,
      nickName: insInternal ? wallet?.nickName : null,
      toWalletId: insInternal ? wallet?.id : null,
    };
  }
}
