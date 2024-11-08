import { ApiProperty } from '@nestjs/swagger';
import { CustodialWallet } from '@prisma/client';

export class CustodialWalletsDto
  implements
    Omit<CustodialWallet, 'id' | 'privateKey' | 'privateKeyVI' | 'userId'>
{
  @ApiProperty()
  address: string;

  @ApiProperty()
  publicKey: string;

  @ApiProperty()
  createdAt: Date;
}
