import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { pick } from 'lodash';
import { GetCustodialWalletsDto } from './custodial.dto';

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
}
