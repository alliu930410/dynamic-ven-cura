import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { pick } from 'lodash';
import { GetCustodialWalletsDto } from './custodial.dto';
import { generateKey } from 'src/utils/keygen';
import { encryptKey } from 'src/utils/crypto';

@Injectable()
export class CustodialService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async createWallet(dynamicUserId: string): Promise<GetCustodialWalletsDto> {
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
            privateKeyVI: iv,
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
            privateKeyVI: iv,
            publicKey,
          },
        },
      },
    });

    return {
      address,
      nickName,
      publicKey,
      createdAt: new Date(),
    };
  }
}
