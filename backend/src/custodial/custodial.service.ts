import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { pick } from 'lodash';
import {
  CreateCustodialWalletDto,
  GetBalanceDto,
  GetCustodialWalletsDto,
  SendTransactionReceiptDto,
  SignedMessageDto,
} from './custodial.dto';
import { generateKey } from 'src/utils/keygen';
import { decryptKey, encryptKey } from 'src/utils/crypto';
import { EVMService } from 'src/evm/evm.service';
import { Prisma } from '@prisma/client';
import { ethers, Provider } from 'ethers';
import { WalletNotFoundException } from './custodial.exceptions';

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
    const signingWallet = await this.getSigningWallet(dynamicUserId, address);
    try {
      const transactionHash = await this.evmService.sendTransaction(
        chainId,
        signingWallet,
        to,
        amountInEth,
      );

      return {
        chainId,
        address,
        to,
        amountInEth,
        transactionHash,
      };
    } catch (error) {
      console.log('Error sending transaction', error);
      throw error;
    }
  }
}
