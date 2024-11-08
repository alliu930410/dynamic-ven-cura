import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { pick } from 'luxon';
import { GetCustodialWalletsDto } from './custodial.dto';

@Injectable()
export class CustodialService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCustodialWallets(
    dynamicUserId: string,
  ): Promise<GetCustodialWalletsDto[]> {
    const custodialWallets = await this.prismaService.custodialWallet.findMany({
      where: {
        user: {
          dynamicUserId: dynamicUserId,
        },
      },
    });

    return pick(custodialWallets, ['address', 'publicKey', 'createdAt']);
  }
}
