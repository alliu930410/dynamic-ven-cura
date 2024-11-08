import { ApiProperty } from '@nestjs/swagger';
import { CustodialWallet } from '@prisma/client';

export class GetCustodialWalletsDto
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

export class DynamicUserDto {
  @ApiProperty()
  dynamicUserId: string;
}

export class AuthenticatedDynamicUserDto {
  user: DynamicUserDto;
}
